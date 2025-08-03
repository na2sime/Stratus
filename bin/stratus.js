#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

// Import commands
import { createCommand } from '../cli-dist/commands/create.js';
import { devCommand } from '../cli-dist/commands/dev.js';
import { buildCommand } from '../cli-dist/commands/build.js';
import { generateCommand } from '../cli-dist/commands/generate.js';
import { deployCommand } from '../cli-dist/commands/deploy.js';

program
  .name('stratus')
  .description('Stratus React Framework CLI')
  .version(packageJson.version);

// Welcome message
console.log(chalk.blue.bold('\n⚡ Stratus CLI'));
console.log(chalk.gray(`Version ${packageJson.version}\n`));

// Register commands
program
  .command('create <project-name>')
  .description('Create a new Stratus project')
  .option('-t, --template <template>', 'Project template', 'default')
  .option('--ssr', 'Enable Server-Side Rendering')
  .option('--js', 'Use JavaScript instead of TypeScript')
  .action(createCommand);

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '5173')
  .option('--ssr', 'Enable SSR development mode')
  .action(devCommand);

program
  .command('build')
  .description('Build for production')
  .option('--ssr', 'Build with SSR support')
  .option('--static', 'Generate static pages')
  .action(buildCommand);

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate pages, services, or layouts')
  .option('-d, --dir <directory>', 'Target directory')
  .option('--service', 'Generate with service')
  .action(generateCommand);

program
  .command('deploy')
  .description('Deploy to production')
  .option('-p, --platform <platform>', 'Deployment platform (vercel|netlify|docker|node)')
  .option('--build', 'Build before deploying')
  .action(deployCommand);

program
  .command('info')
  .description('Show project info')
  .action(() => {
    console.log(chalk.green('📦 Stratus Project Information'));
    console.log(chalk.yellow('Framework Version:'), packageJson.version);
    console.log(chalk.yellow('Node Version:'), process.version);
    console.log(chalk.yellow('Platform:'), process.platform);
    
    try {
      const stratusConfig = JSON.parse(readFileSync(join(process.cwd(), 'stratus.config.json'), 'utf8'));
      console.log(chalk.yellow('Project Config:'), JSON.stringify(stratusConfig, null, 2));
    } catch {
      console.log(chalk.gray('No stratus.config.json found'));
    }
  });

// Error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('Run `stratus --help` for available commands'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}