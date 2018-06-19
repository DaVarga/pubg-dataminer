import * as fs from "fs";
import {Directory} from "./directory";
import {ConfigManager} from "../config/configManager";


export class IdDatabase {
  private filePath: string;
  private catalog: Set<string>;

  constructor(private configManager: ConfigManager, region: string) {
    const directoryPath = this.getDirectoryPath();
    new Directory(directoryPath).create();

    this.filePath = directoryPath + this.getIdFileName(region);
    this.catalog = this.loadIdFile(this.filePath);
    console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] loaded "${this.filePath}" with ${this.catalog.size} ids`);
  }

  get ids(): Set<string> {
    return this.catalog;
  }

  addToDatabase(ids: Set<String>): number {
    const initialSize = this.catalog.size;
    ids.forEach((id: string) => this.catalog.add(id));
    const addedIds = this.catalog.size - initialSize;
    console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] added "${addedIds}" ids to "${this.filePath}"`);
    return addedIds;
  }

  persistDatabase() {
    fs.writeFileSync(this.filePath, JSON.stringify(Array.from(this.catalog), null, 2));
    console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] persisted "${this.catalog.size}" ids to "${this.filePath}"`);
  }

  private loadIdFile(path: string): Set<string> {
    try {
      const content = fs.readFileSync(path, 'utf8');

      return new Set<string>(JSON.parse(content));
    } catch (e) {
      console.error(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] error loading "${this.filePath}" ids database, creating new`);

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
