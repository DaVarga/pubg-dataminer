import {exec} from 'child_process';

export class Compressor {
  public async compressMatch(match: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(`7za a "${match}" "${match}/*"`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
