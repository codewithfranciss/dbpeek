import { Command } from 'commander';

const program = new Command();

program
  .name('dbpeek')
  .description('Database Schema Inspector for Docker')
  .version('1.0.0');

program
  .command('inspect')
  .description('Interactive database inspection')
  .action(() => {
    console.log('Inspection mode coming soon...');
  });

program
  .command('web')
  .description('Start the web UI')
  .action(() => {
    console.log('Web UI coming soon...');
  });

program.parse();
