import 'reflect-metadata';
import { Container } from 'typedi';
import { MatchIdLoop } from './services/fetcher/match-id-loop.service';

const matchIdLoop = Container.get(MatchIdLoop);
matchIdLoop.run().then(()=>{
  process.exit();
});

process.on('SIGINT', () => {
  matchIdLoop.stop();
});
