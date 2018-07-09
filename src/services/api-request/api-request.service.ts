import { Service } from 'typedi';
import { Logger } from '../logger/logger.service';
import * as request from 'request';
import { Response } from 'request';
import { ConfigManager } from '../config/config-manager.service';

@Service()
export class ApiRequester {

  constructor(private logger: Logger, private configManager: ConfigManager) {
  }

  public async getMatchIds(apiKey: string, region: string, startDate: Date): Promise<string> {
    const options: request.CoreOptions & request.UrlOptions  = {
      url: `${this.configManager.config.apiBaseUrl}/shards/${region}/samples?filter[createdAt-start]=${startDate.toISOString()}`,
      port: 443,
      method: 'GET',
      headers: {
        accept: 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`,
      },
      gzip: this.configManager.config.gzip,
    };
    return this.request(options);
  }

  public async getMatchInfo(region: string, matchId: string): Promise<string> {
    const options: request.CoreOptions & request.UrlOptions  = {
      url: `${this.configManager.config.apiBaseUrl}/shards/${region}/matches/${matchId}`,
      port: 443,
      method: 'GET',
      headers: {
        accept: 'application/vnd.api+json',
      },
      gzip: this.configManager.config.gzip,
    };
    return this.request(options);
  }

  public async getMatchTelemetry(apiUrl: string): Promise<string> {
    const options: request.CoreOptions & request.UrlOptions = {
      url: apiUrl,
      port: 443,
      method: 'GET',
      headers: {
        accept: 'application/vnd.api+json',
      },
      gzip: this.configManager.config.gzip,
    };
    return this.request(options);
  }

  private async request(options: request.CoreOptions & request.UrlOptions): Promise<string> {
    this.logger.debug('requesting:\n', options);
    return new Promise<string>((resolve, reject) => {
      request(options, (error: any, response: Response, body: any) => {
        if(error) {
          this.logger.error(error);
          reject(error);
        } else {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(body);
          } else {
            this.logger.error(`ERROR: ${response.statusCode}`, `BODY: ${body}`);
            reject(response.statusCode);
          }
        }

      });
    });
  }
}
