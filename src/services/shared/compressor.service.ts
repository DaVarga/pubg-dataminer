import { exec } from 'child_process';
import { Service } from 'typedi';

@Service()
export class Compressor {

  /**
   * @deprecated
   */
  public async decompressMatch(match: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(`7za e "${match}.7z"`,{cwd: match}, (error: Error, stdout: string) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
