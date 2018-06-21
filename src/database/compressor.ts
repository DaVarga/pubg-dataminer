import {exec} from 'child_process';
import {ConfigManager} from "../config/configManager";

export class Compressor {
  constructor(private configManager: ConfigManager){}
  public async compressMatch(match: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(`7za a ${this.configManager.config.execParams7z} "${match}" "${match}/*"`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
