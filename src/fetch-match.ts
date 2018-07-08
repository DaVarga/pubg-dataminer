import 'reflect-metadata';
import { Container } from 'typedi';
import { TelemetryFetcher } from './services/fetcher/telemetry-fetcher.service';

const telemetryFetcher = Container.get(TelemetryFetcher);
telemetryFetcher.run().then(()=>{
  process.exit();
});

process.on('SIGINT', () => {
  telemetryFetcher.stop();
});
