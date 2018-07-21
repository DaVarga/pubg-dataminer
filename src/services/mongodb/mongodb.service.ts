import { ConfigManager } from '../config/config-manager.service';
import { Logger } from '../logger/logger.service';
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
      let client = await MongoClient.connect(this.configManager.config.mognoDbUrl, {useNewUrlParser: true});
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
      const chunks = [];
      for (let i = 0; i < operations.length; i += 1000) {
        chunks.push(operations.slice(i, i + 1000));
      }
      await Promise.all(chunks.map(chunk => this.db.collection('telemetry').bulkWrite(chunk)));
    } catch (e) {
      this.logger.error('error inserting match', e);
    }
  }

  async matchExists(id: string): Promise<boolean> {
    return !!(await this.db.collection('info').findOne({_id: id}));
  }

}
