export interface IConfigFile {
    keys: Key[];
    regions: string[];
    dbPath: string;
}

export type Key = { bearer: string; rpm: number };
