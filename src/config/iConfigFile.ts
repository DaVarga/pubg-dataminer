export interface IConfigFile {
  keys: Key[];
  regions: string[];
  dbPath: string;
  matchConcurrency: number;
}

export type Key = { bearer: string; rpm: number };
