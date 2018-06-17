import {Directory} from "./directory";
import * as fs from "fs";
import {ConfigManager} from "../config/configManager";
import {Compressor} from "./compressor";

export class MatchDatabase {

  private compressor: Compressor = new Compressor();

  constructor(private configManager: ConfigManager) {
  }

  public checkMatch(region: string, matchId: string) {
    const path = this.getDirectoryPath(region, matchId);
    return new Directory(path + '.7z').exists()
  }

  public async addMatch(region: string, matchId: string, info: any, telemetry: any): Promise<void> {
    const path = this.getDirectoryPath(region, matchId);
    new Directory(path).create();
    try {
      let pathes: string[] = await Promise.all([
        this.writeToDisk(path + '/info.json', info),
        this.writeToDisk(path + '/telemetry.json', telemetry)
      ]);
      console.log(await this.compressor.compressMatch(pathes, path));
      //remove uncompressed files and folders
      pathes.forEach(fs.unlinkSync);
      fs.rmdirSync(path);
    } catch (e) {
      console.error(`could not save ${region} ${matchId}, error: ${e}`);
    }
  }

  private getDirectoryPath(region: string, matchId: string): string {
    return this.configManager.config.dbPath + ['matches', region, matchId].join('/');
  }

  private writeToDisk(path: string, data: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.writeFile(path, data, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(path);
      });
    })
  }
}
