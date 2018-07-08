import * as fs from 'fs';
import { Service } from 'typedi';
import { CompressorService } from './compressor.service';
import { ConfigManager } from '../config/config-manager.service';
import { DirectoryFactory } from './directory.service';
import { Logger } from '../logger/logger.service';

@Service()
export class MatchDatabase {

  constructor(
    private configManager: ConfigManager,
    private compressor: CompressorService,
    private directoryFactory: DirectoryFactory,
    private logger: Logger,
  ) {
  }

  public checkMatch(region: string, matchId: string) {
    const path = this.getDirectoryPath(region, matchId);
    return this.directoryFactory.create(path + '.7z').exists();
  }

  public async addMatch(region: string, matchId: string, info: any, telemetry: any): Promise<void> {
    const path = this.getDirectoryPath(region, matchId);
    this.directoryFactory.create(path).createDirectory();
    try {
      let paths: string[] = await Promise.all([
                                                 this.writeToDisk(path + '/info.json', info),
                                                 this.writeToDisk(path + '/telemetry.json', telemetry),
                                               ]);
      await this.compressor.compressMatch(path);
      this.logger.info(`created ${path}.7z`);
      //remove uncompressed files and folders
      paths.forEach(fs.unlinkSync);
      fs.rmdirSync(path);
    } catch (e) {
      this.logger.error(`could not save ${region} ${matchId}, error: ${e}`);
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
    });
  }
}
