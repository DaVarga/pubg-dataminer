import 'reflect-metadata';
import { Container } from 'typedi';
import { TelemetryFetcher } from './services/master/telemetry-fetcher.service';
import * as cluster from 'cluster';
import { Worker } from './services/worker/worker.service';

if (cluster.isMaster) {
  const telemetryFetcher = Container.get(TelemetryFetcher);
  telemetryFetcher.run().then(() => {
    process.exit();
  });

  process.on('SIGINT', () => {
    telemetryFetcher.stop();
  });
} else if (cluster.isWorker) {
  const worker = Container.get(Worker);
  worker.init();
}
