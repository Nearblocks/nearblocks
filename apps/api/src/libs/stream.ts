import stream from 'node:stream';

import pg from 'pg';
import { Response } from 'express';
import QueryStream from 'pg-query-stream';
import { stringify, Options } from 'csv-stringify';

import config from '#config';
import { StreamTransformWrapper } from '#ts/types';

export const streamCsv = (
  res: Response,
  query: string,
  values: any[],
  columns: Options['columns'],
  transformWrapper: StreamTransformWrapper,
) => {
  const pool = new pg.Pool({
    connectionString: config.dbUrl,
    max: 1,
  });
  const stringifier = stringify({
    header: true,
    columns,
  });

  pool.connect((err, client, done) => {
    if (err) res.status(200);

    const queries = new QueryStream(query, values);
    const streams = client.query(queries);

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
