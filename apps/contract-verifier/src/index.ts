import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

import axios from 'axios';
import bs58 from 'bs58';

import { retry } from 'nb-utils';

import config from '#config';
import { connection, Worker } from '#libs/bullmq';
import logger from '#libs/logger';
import sql from '#libs/postgres';
import sentry from '#libs/sentry';

// Promisify exec for use with async/await
const execAsync = util.promisify(exec);

async function getOnChainCodeHash(accountId: string) {
  const response = await axios.post(config.rpcUrl, {
    id: 'dontcare',
    jsonrpc: '2.0',
    method: 'query',
    params: {
      account_id: accountId,
      finality: 'final',
      request_type: 'view_account',
    },
  });
  return response.data.result.code_hash;
}

async function verifyContract(
  accountId: string,
  contractZipBuffer: Buffer,
  outputPath: string,
) {
  const contractZipPath = '/app/apps/contract-verifier/contract.zip';
  const sourcePath = '/app/apps/contract-verifier/source';
  const tmpPath = '/app/apps/contract-verifier/tmp';

  try {
    // Cleanup previous files
    if (fs.existsSync(contractZipPath)) fs.unlinkSync(contractZipPath);
    if (fs.existsSync(sourcePath))
      fs.rmSync(sourcePath, { force: true, recursive: true });
    if (fs.existsSync(outputPath))
      fs.rmSync(outputPath, { force: true, recursive: true });
    if (fs.existsSync(tmpPath))
      fs.rmSync(tmpPath, { force: true, recursive: true });

    const contractUint8Array = new Uint8Array(contractZipBuffer);

    // Create the contract ZIP file from buffer
    fs.writeFileSync(contractZipPath, contractUint8Array);

    // Unzip the contract folder and execute the build commands
    const commands = `
      mkdir -p ${sourcePath} ${tmpPath} ${outputPath} &&
      unzip -q ${contractZipPath} -d ${tmpPath} &&
      cd ${tmpPath} &&
      if [ -d * ]; then
        mv */* ${sourcePath};
      else
        mv * ${sourcePath};
      fi &&
      rm -rf ${tmpPath} &&
      sh /app/apps/contract-verifier/build.sh ${sourcePath} ${outputPath}
    `;

    const { stderr, stdout } = await execAsync(commands);

    if (stdout) logger.info(`Shell command output: ${stdout}`);

    if (stderr) logger.info(`Shell command logs: ${stderr}`);

    const hashFilePath = path.join(outputPath, 'wasm_hash.txt');

    if (!fs.existsSync(hashFilePath)) {
      return false;
    }

    const sha256HashHex = fs.readFileSync(hashFilePath, 'utf-8').trim();

    if (!sha256HashHex) {
      return false;
    }

    const hashBuffer = Buffer.from(sha256HashHex, 'hex');
    const uint8Array = new Uint8Array(hashBuffer);
    const builtCodeHash = bs58.encode(uint8Array);
    const onChainCodeHash = await retry(() => getOnChainCodeHash(accountId));

    const isVerified = builtCodeHash === onChainCodeHash;

    if (isVerified) {
      logger.info('Contract verified: hashes match');
      // Update the contract table with hash if the contract is verified successfully
      await sql`
        INSERT INTO
          contracts (contract, hash)
        VALUES
          (
            ${accountId},
            ${builtCodeHash}
          )
        ON CONFLICT (contract) DO
        UPDATE
        SET
          hash = ${builtCodeHash},
          TIMESTAMP = DEFAULT
      `;
    } else {
      logger.info('Hashes do not match');
    }

    return isVerified;
  } catch (error) {
    logger.info('Contract building failed');
    logger.error(error);
    sentry.captureException(error);
    return false;
  }
}

// Worker logic to process the queue
const worker = new Worker(
  'contract-verification-queue',
  async (job) => {
    const { accountId, contractZip, verificationId } = job.data;

    if (!accountId || !contractZip || !verificationId) {
      logger.error('Missing data in job');
      return;
    }

    try {
      const contractZipBuffer = Buffer.from(contractZip.data);
      const outputPath = path.resolve('/app/apps/contract-verifier/output');

      const isVerified = await verifyContract(
        accountId,
        contractZipBuffer,
        outputPath,
      );

      const status = isVerified ? 'SUCCESS' : 'FAILURE';

      // Update the verification status in the database
      await sql`
        UPDATE contract_verifications
        SET
          status = ${status},
          updated_at = DEFAULT
        WHERE
          id = ${verificationId}
      `;
    } catch (error) {
      logger.error('Error in verification process');
      logger.error(error);
      sentry.captureException(error);
    }
  },
  { connection },
);

worker.on('completed', () => {
  logger.info(`Job has been completed`);
});

worker.on('failed', () => {
  logger.error(`Job has failed`);
});

// Start processing the queue
worker
  .waitUntilReady()
  .then(() => {
    logger.info('Worker is ready to process jobs');
  })
  .catch((err) => {
    logger.error(`Worker failed to start: ${err.message}`);
  });
