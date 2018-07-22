import 'reflect-metadata';
import { Container } from 'typedi';
import { Importer } from './services/master/importer.service';

const importer = Container.get(Importer);
importer.run().then(()=>{
  process.exit();
});

process.on('SIGINT', () => {
  importer.stop();
});
