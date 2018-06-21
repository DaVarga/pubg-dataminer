import * as fs from 'fs';
import {IConfigFile} from './iConfigFile';

export class ConfigManager {
  private defaults: IConfigFile = {
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
    execParams7z: '-mx=3',
  };

  private configObj: IConfigFile = this.defaults;

  constructor(fileName: string) {
    if (fs.existsSync(fileName)) {
      this.updateOptions(fileName);
    } else {
      fs.writeFileSync(fileName, JSON.stringify(this.defaults, null, 2));
    }
    fs.watchFile(fileName, () => {
      this.updateOptions(fileName);
    });

  }

  public get config(): IConfigFile {
    return this.configObj;
  }

  private updateOptions(file: string): void {
    Object.assign(this.configObj,this.defaults, JSON.parse(fs.readFileSync(file, {encoding: 'utf8', flag: 'r'})));
  }
}
