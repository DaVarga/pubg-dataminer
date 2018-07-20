import * as fs from 'fs';
import { Service } from 'typedi';
import { Compressor } from './compressor.service';
import { ConfigManager } from '../config/config-manager.service';
import { DirectoryFactory } from './directory.service';
import { Logger } from '../logger/logger.service';
import { Mongodb } from '../mongodb/mongodb.service';

@Service()
export class MatchDatabase {

  constructor(
    private configManager: ConfigManager,
    private compressor: Compressor,
    private directoryFactory: DirectoryFactory,
    private logger: Logger,
    private mongodb: Mongodb,
  ) {
  }

  /**
   * @deprecated
   */
  public getZippedIds(region: string): string[] {
    const dir = this.getDirectory(region);
    if (fs.existsSync(dir)) {
      return fs.readdirSync(this.getDirectory(region)).filter(zip => zip.endsWith('.7z')).map(zip => zip.slice(0, -3));
    } else {
      return [];
    }
  }

  public async checkMatch(region: string, matchId: string) {
    if (await this.mongodb.matchExists(matchId)) {
      return true;
    }
    const path = this.getDirectory(region, matchId);
    return this.directoryFactory.create(path + '.7z').exists();
  }

  public async addMatch(matchId: string, info: any, telemetry: any): Promise<void> {
    info._id = matchId;
    return this.mongodb.insertMatch(info, telemetry);
  }

  /**
   * @deprecated
   */
  public async getZippedMatch(region: string, matchId: string): Promise<{ info: any, telemetry: any[] }> {
    return new Promise<{ info: any, telemetry: any[] }>(async (resolve, reject) => {
      try {
        const path = this.getDirectory(region, matchId);
        this.directoryFactory.create(path).createDirectory();
        await this.compressor.decompressMatch(path);
        const contents: string[] = await Promise.all([
                                                       this.readFromDisk(path + '/info.json'),
                                                       this.readFromDisk(path + '/telemetry.json'),
                                                     ]);
        const parsed = {
          info: JSON.parse(contents[0]),
          telemetry: JSON.parse(contents[1]),
        };
        this.logger.info(`loaded ${path}.7z`);
        //remove uncompressed files and folders
        [path + '/info.json', path + '/telemetry.json'].forEach(fs.unlinkSync);
        fs.rmdirSync(path);
        resolve(parsed);
      } catch (e) {
        this.logger.error(`could not load ${region} ${matchId}, error: ${e}`);
        reject(e);
      }
    });

  }

  /**
   * @deprecated
   */
  private getDirectory(region: string, matchId?: string): string {
    return this.configManager.config.dbPath + ['matches', region, matchId].join('/');
  }

  /**
   * @deprecated
   */
  private readFromDisk(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
}
