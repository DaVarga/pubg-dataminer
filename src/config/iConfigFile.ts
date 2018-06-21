export interface IConfigFile {
  keys: Key[];
  regions: string[];
  dbPath: string;
  matchConcurrency: number;
  execParams7z: string,
}

export type Key = { bearer: string; rpm: number };
