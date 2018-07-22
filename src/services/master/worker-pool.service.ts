import * as cluster from 'cluster';
import { Service } from 'typedi';
import { ConfigManager } from '../shared/config-manager.service';
import { MessageWorkerDone } from '../../types/message-worker-done';
import { Logger } from '../shared/logger.service';
import { MessageTelemetryFetch } from '../../types/message-telemetry-fetch';

@Service()
export class WorkerPool {

  private idlingWorkers = new Set<cluster.Worker>();
  private busyWorkers = new Set<cluster.Worker>();

  constructor(
    private configManager: ConfigManager,
    private logger: Logger,
  ) {
  }

  async init(): Promise<void> {
    let workerInits = [];
    for (let i = 0; i < this.configManager.config.matchConcurrency; i++) {
      workerInits.push(this.createWorker());
    }
    return Promise.all(workerInits).then(workers => {
      workers.forEach(worker => this.idlingWorkers.add(worker));
    });
  }

  async fetchTelemetry(id: string, region: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.idlingWorkers.size === 0) {
        return reject();
      }
      let worker = this.idlingWorkers.values().next().value;
      this.idlingWorkers.delete(worker);
      this.busyWorkers.add(worker);
      worker.once('message', (msg) => {
        this.workerDone(msg, worker);
        resolve();
      });
      let msg: MessageTelemetryFetch = {
        id: id,
        region: region,
        msgType: 'telemetryFetch',
      };
      worker.send(msg);
    });
  }

  private workerDone(msg: MessageWorkerDone, worker: cluster.Worker) {
    if (!msg.success) {
      this.logger.error(msg.err);
    }
    this.busyWorkers.delete(worker);
    this.idlingWorkers.add(worker);
  }

  private createWorker(): Promise<cluster.Worker> {
    return new Promise<cluster.Worker>((resolve, reject) => {
      let worker = cluster.fork();
      worker.once('message', (msg) => {
        if (msg.ready) {
          resolve(worker);
        } else {
          reject(worker);
        }
      });
    });
  }
}
