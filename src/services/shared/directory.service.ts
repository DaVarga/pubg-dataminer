import * as fs from 'fs';
import { Service } from 'typedi';

@Service()
export class DirectoryFactory {

  constructor() {
  }

  create(dirPath: string) {
    return new Directory(dirPath);
  }

}


@Service({factory: [DirectoryFactory, 'create']})
export class Directory {
  constructor(private dirPath: string) {
  }

  get path(): string {
    return this.dirPath;
  }

  exists(): boolean {
    return fs.existsSync(this.path);
  }

  createDirectory() {
    this.dirPath.split('/')
      .reduce((currentPath, folder) => {
        currentPath += folder + '/';
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
        return currentPath;
      }, '');
  }
}
