import express, { Router } from 'express';

import schema from '#libs/schema/node';
import validator from '#middlewares/validator';
import node from '#services/node';

const route = Router();

const routes = (app: Router) => {
  app.use('/node', express.json(), route);

  /**
   * Telemetry
   * @typedef {object} Telemetry
   * @property {Agent} agent.required - agent info
   * @property {Chain} chain.required - chain info
   * @property {System} system.required - system info
   * @property {string} signature - node signature
   */
  /**
   * Agent
   * @typedef {object} Agent
   * @property {string} build.required - agent build
   * @property {string} name.required - agent name
   * @property {string} version.required - agent version
   */
  /**
   * Chain
   * @typedef {object} Chain
   * @property {string} account_id - account id
   * @property {number} block_production_tracking_delay - block production tracking delay
   * @property {boolean} is_validator.required - is validator
   * @property {string} latest_block_hash.required - latest block hash
   * @property {number} latest_block_height.required - latest block height
   * @property {number} max_block_production_delay - max block production delay
   * @property {number} max_block_wait_delay - max block wait delay
   * @property {number} min_block_production_delay - min block production delay
   * @property {string} node_id.required - node id
   * @property {number} num_peers.required - number of peers
   * @property {string} status.required - status
   */
  /**
   * System
   * @typedef {object} System
   * @property {string} bandwidth_download.required - download bandwidth
   * @property {string} bandwidth_upload.required.required - upload bandwidth
   * @property {integer} boot_time_seconds - boot time in seconds
   * @property {integer} cpu_usage.required - cup usage
   * @property {integer} memory_usage.required - memonry usage
   */
  /**
   * POST /v1/node/telemetry
   * @summary POST node telemetry details
   * @tags Node
   * @param {Telemetry} request.body.required - node telemetry info
   * @return 200 - success response
   */
  route.post('/telemetry', validator(schema.telemetry), node.telemetry);
};

export default routes;
