import { LogLevel } from './log-level';

export interface ConfigFile {
  keys: Key[];
  regions: string[];
  dbPath: string;
  matchConcurrency: number;
  logLevel: LogLevel,
  apiBaseUrl: string,
  gzip: boolean,
  mognoDbUrl: string,
  mongoDbName: string,
  mongoPoolSize: number,
  mongoInsertChunkSize: number,
}

export interface Key {
  bearer: string;
  rpm: number;
}
