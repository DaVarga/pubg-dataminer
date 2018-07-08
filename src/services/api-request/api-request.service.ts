import * as https from 'https';
import * as url from 'url';
import { Service } from 'typedi';
import { Logger } from '../logger/logger.service';

@Service()
export class ApiRequester {

  constructor(private logger: Logger) {
  }

  public async getMatchIds(apiKey: string, region: string, startDate: Date): Promise<string> {
    const options: https.RequestOptions = {
      headers: {
        accept: 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`,
      },
      host: 'api.playbattlegrounds.com',
      port: 443,
      method: 'GET',
      path: `/shards/${region}/samples?filter[createdAt-start]=${startDate.toISOString()}`,
    };
    return this.request(options);
  }

  public async getMatchInfo(region: string, matchId: string): Promise<string> {
    const options: https.RequestOptions = {
      headers: {
        accept: 'application/vnd.api+json',
      },
      host: 'api.playbattlegrounds.com',
      port: 443,
      method: 'GET',
      path: `/shards/${region}/matches/${matchId}`,
    };
    return this.request(options);
  }

  public async getMatchTelemetry(apiUrl: string): Promise<string> {
    const options: https.RequestOptions = {
      headers: {
        accept: 'application/vnd.api+json',
      },
      host: url.parse(apiUrl).host,
      port: 443,
      method: 'GET',
      path: url.parse(apiUrl).path,
    };
    return this.request(options);
  }

  private async request(options: https.RequestOptions): Promise<string> {
    this.logger.debug(Date.now(), 'requesting:\n', options);
    return new Promise<string>((resolve, reject) => {
      https.get(options, (res: any) => {
        let data: string = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            this.logger.error(`ERROR: ${res.statusCode}`, `BODY: ${data}`);
            reject(res.statusCode);
          }
        });
      }).on('error', (e: any) => {
        this.logger.error(e);
        reject(e);
      });
    });
  }
}
