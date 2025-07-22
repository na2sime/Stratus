import chalk from 'chalk';
import ora from 'ora';
export class Logger {
    constructor() {
        this.spinner = null;
    }
    info(message) {
        console.log(chalk.blue('ℹ'), message);
    }
    success(message) {
        console.log(chalk.green('✓'), message);
    }
    warn(message) {
        console.log(chalk.yellow('⚠'), message);
    }
    error(message) {
        console.log(chalk.red('✗'), message);
    }
    startSpinner(message) {
        this.spinner = ora(message).start();
    }
    updateSpinner(message) {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }
    succeedSpinner(message) {
        if (this.spinner) {
            this.spinner.succeed(message);
            this.spinner = null;
        }
    }
    failSpinner(message) {
        if (this.spinner) {
            this.spinner.fail(message);
            this.spinner = null;
        }
    }
    stopSpinner() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
}
export const logger = new Logger();
