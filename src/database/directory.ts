import * as fs from "fs";

export class Directory {
  constructor(private dirPath: string) {
  }

  get path(): string {
    return this.dirPath;
  }

  exists(): boolean {
    return fs.existsSync(this.path);
  }

  create() {
    this.dirPath.split('/')
      .reduce((currentPath, folder) => {
        currentPath += folder + '/';
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
        return currentPath;
      }, '');
  }

  getContents(): string[] {
    return fs.readdirSync(this.path);
  }
}
