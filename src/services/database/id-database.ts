import * as fs from 'fs';
import { Service } from 'typedi';
import { ConfigManager } from '../config/config-manager.service';
import { DirectoryFactory } from './directory.service';
import { Logger } from '../logger/logger.service';

@Service()
export class IdDatabaseFactory {

  constructor(
    private configManager: ConfigManager,
    private directoryFactory: DirectoryFactory,
    private logger: Logger,
  ) {
  }

  create(region: string) {
    return new IdDatabase(this.configManager, this.directoryFactory, this.logger, region);
  }

}

@Service({factory: [IdDatabaseFactory, 'create']})
export class IdDatabase {
  private readonly filePath: string;
  private readonly catalog: Set<string>;

  constructor(
    private configManager: ConfigManager,
    private directoryFactory: DirectoryFactory,
    private logger: Logger,
    region: string,
  ) {
    const directoryPath = this.getDirectoryPath();
    this.directoryFactory.create(directoryPath).createDirectory();

    this.filePath = directoryPath + this.getIdFileName(region);
    this.catalog = this.loadIdFile(this.filePath);
    this.logger.debug(`loaded "${this.filePath}" with ${this.catalog.size} ids`);
  }

  get ids(): Set<string> {
    return this.catalog;
  }

  addToDatabase(ids: Set<String>): number {
    const initialSize = this.catalog.size;
    ids.forEach((id: string) => this.catalog.add(id));
    const addedIds = this.catalog.size - initialSize;
    this.logger.info(`added "${addedIds}" ids to "${this.filePath}"`);
    return addedIds;
  }

  persistDatabase() {
    fs.writeFileSync(this.filePath, JSON.stringify(Array.from(this.catalog), null, 2));
    this.logger.debug(`persisted "${this.catalog.size}" ids to "${this.filePath}"`);
  }

  private loadIdFile(path: string): Set<string> {
    try {
      const content = fs.readFileSync(path, 'utf8');

      return new Set<string>(JSON.parse(content));
    } catch (e) {
      this.logger.debug(`error loading "${this.filePath}" ids database, creating new`);

      return new Set<string>();
    }
  }

  private getIdFileName(region: string): string {
    return `match-ids_${region}.json`;
  }

  private getDirectoryPath(): string {
    return this.configManager.config.dbPath;
  }

}
