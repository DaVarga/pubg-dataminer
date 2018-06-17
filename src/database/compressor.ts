import {exec} from 'child_process';

export class Compressor {
  public async compressMatch(files: string[], dest: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(`7za a ${dest} ${files.join(' ')}`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
