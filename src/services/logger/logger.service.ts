import { ConfigManager } from '../config/config-manager.service';
import { Service } from 'typedi';
import { LogLevel } from '../../types/log-level';

@Service()
export class Logger {
  constructor(private configManager: ConfigManager) {
  }

  debug(...msg: any[]) {
    if (this.configManager.config.logLevel === LogLevel.debug) {
      return console.debug.apply(console, [this.getTimeTag(), ...msg]);
    }
  }

  info(...msg: any[]) {
    if (this.configManager.config.logLevel <= LogLevel.info) {
      return console.info.apply(console, [this.getTimeTag(), ...msg]);
    }
  }

  warn(...msg: any[]) {
    if (this.configManager.config.logLevel <= LogLevel.warn) {
      return console.warn.apply(console, [this.getTimeTag(), ...msg]);
    }
  }

  error(...msg: any[]) {
    if (this.configManager.config.logLevel <= LogLevel.error) {
      return console.error.apply(console, [this.getTimeTag(), ...msg]);
    }
  }

  private getTimeTag(date: Date = new Date()) {
    return `[${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${date.getMilliseconds()
      .toString(10)
      .padStart(3,'0')}]`;
  }
}
