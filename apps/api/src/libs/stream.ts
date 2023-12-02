import stream from 'node:stream';

import { Options, stringify } from 'csv-stringify';
import { Response } from 'express';
import pg from 'pg';
import QueryStream from 'pg-query-stream';

import config from '#config';
import { StreamTransformWrapper } from '#types/types';

import { ssl } from './db.js';

export const streamCsv = (
  res: Response,
  query: string,
  values: unknown[],
  columns: Options['columns'],
  transformWrapper: StreamTransformWrapper,
) => {
  const pool = new pg.Pool({
    connectionString: config.dbUrl,
    max: 1,
    ssl: ssl?.ca ? ssl : false,
  });
  const stringifier = stringify({
    columns,
    header: true,
  });

  pool.connect((err, client, done) => {
    if (err || client === undefined) res.status(200);

    const queries = new QueryStream(query, values);
    const streams = client!.query(queries);

    res.attachment('txns.csv');
    stringifier.pipe(res);

    streams.on('end', () => {
      stringifier.end();
      done();
    });

    streams
      .pipe(
        new stream.Transform({
          objectMode: true,
          transform: transformWrapper(stringifier),
        }),
      )
      .pipe(res);

    streams.on('finish', () => {
      stringifier.end();
      done();
    });
  });
};
