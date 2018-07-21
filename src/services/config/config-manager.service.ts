import * as fs from 'fs';
import { ConfigFile } from '../../types/config-file';
import { LogLevel } from '../../types/log-level';
import { Service } from 'typedi';

@Service()
export class ConfigManager {
  private defaults: ConfigFile = {
    keys: [],
    regions: [
      'pc-as',
      'pc-eu',
      'pc-jp',
      'pc-kakao',
      'pc-krjp',
      'pc-na',
      'pc-oc',
      'pc-ru',
      'pc-sa',
      'pc-sea',
      'xbox-as',
      'xbox-eu',
      'xbox-na',
      'xbox-oc',
    ],
    dbPath: './output/',
    matchConcurrency: 10,
    logLevel: LogLevel.debug,
    apiBaseUrl: 'https://api.playbattlegrounds.com',
    gzip: true,
    mognoDbUrl: 'mongodb://localhost:27017/',
    mongoDbName: 'pubg_telemetry',
    mongoPoolSize: 100,
    mongoInsertChunkSize: 1000,
  };

  private configObj: ConfigFile = this.defaults;
  private fileName: string = 'miner-config.json';

  constructor() {
    if (fs.existsSync(this.fileName)) {
      this.updateOptions(this.fileName);
      fs.writeFileSync(this.fileName, JSON.stringify(this.defaults, null, 2));
    } else {
      fs.writeFileSync(this.fileName, JSON.stringify(this.defaults, null, 2));
    }
    fs.watchFile(this.fileName, () => {
      this.updateOptions(this.fileName);
    });
  }

  public get config(): ConfigFile {
    return this.configObj;
  }

  private updateOptions(file: string): void {
    Object.assign(this.configObj, this.defaults, JSON.parse(fs.readFileSync(file, {encoding: 'utf8', flag: 'r'})));
  }
/*
  private applyArgs() {
    let regions = process.argv
      .slice(2)
      .filter((arg: string) => this.configObj.regions.indexOf(arg) !== -1);
    if(regions.length) {
      this.configObj.regions = regions;
    }
  }*/
}
