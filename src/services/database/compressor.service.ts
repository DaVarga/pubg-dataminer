import { exec } from 'child_process';
import { ConfigManager } from '../config/config-manager.service';
import { Service } from 'typedi';

@Service()
export class CompressorService {
  constructor(private configManager: ConfigManager) {
  }

  public async compressMatch(match: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(`7za a ${this.configManager.config.execParams7z} "${match}" "${match}/*"`, (error: Error, stdout: string) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
