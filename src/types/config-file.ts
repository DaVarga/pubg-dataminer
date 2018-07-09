import { LogLevel } from './log-level';

export interface ConfigFile {
  keys: Key[];
  regions: string[];
  dbPath: string;
  matchConcurrency: number;
  execParams7z: string,
  logLevel: LogLevel,
  apiBaseUrl: string,
  gzip: boolean,
}

export interface Key {
  bearer: string;
  rpm: number;
}
