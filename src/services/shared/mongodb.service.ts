import { ConfigManager } from './config-manager.service';
import { Logger } from './logger.service';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class Mongodb {
  private db: Db;

  constructor(
    private configManager: ConfigManager,
    private logger: Logger,
  ) {
  }

  async connect() {
    try {
      let client = await MongoClient
        .connect(this.configManager.config.mognoDbUrl, {useNewUrlParser: true, poolSize: this.configManager.config.mongoPoolSize});
      this.db = await client.db(this.configManager.config.mongoDbName);
      this.logger.debug(`Connected to ${this.configManager.config.mognoDbUrl}${this.configManager.config.mongoDbName}`);
      return true;
    } catch (e) {
      this.logger.error('Unable to connect to db', e);
      return false;
    }
  }

  async insertMatch(info: any, telemetryObjects: any[]) {
    try {
      let infoInsert = await this.db.collection('info').insertOne(info);
      let operations = telemetryObjects.map(doc => {
        doc.matchRef = infoInsert.insertedId;
        return {'insertOne': {'document': doc}};
      });
      const chunks = this.getChunks(operations, this.configManager.config.mongoInsertChunkSize);
      let result = await Promise.all(chunks.map(chunk => this.db.collection('telemetry').bulkWrite(chunk)));
      this.logger
        .info(`Inserted match ${infoInsert.insertedId} with ${result.reduce((prev, res) => res.insertedCount + prev, 0)} objects`);
    } catch (e) {
      this.logger.error('error inserting match', e);
    }
  }

  async matchExists(id: string): Promise<boolean> {
    return !!(await this.db.collection('info').findOne({_id: id}));
  }

  private getChunks(array: any[], chunkSize: number) {
    if (chunkSize <= 0) {
      chunkSize = 1;
    }
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks

  }
}
