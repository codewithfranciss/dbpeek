import { Command } from 'commander';
import inquirer from 'inquirer';
import { PeekEngine } from './core/engine.js';
import { CLIFormatter } from './utils/cli-formatter.js';

const program = new Command();
const engine = new PeekEngine();

program
  .name('dbpeek')
  .description('Database Schema Inspector for Docker')
  .version('1.0.0');

program
  .command('inspect')
  .description('Interactive database inspection')
  .action(async () => {
    try {
      console.log(CLIFormatter.formatHeader('dbpeek inspection'));
      
      const containers = await engine.discoverDatabases();
      
      if (containers.length === 0) {
        console.log(CLIFormatter.formatError('No database containers found. Make sure your Docker containers are running.'));
        return;
      }

      const { containerId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'containerId',
          message: 'Select a container to inspect:',
          choices: containers.map(c => ({
            name: `${c.name} (${c.image})`,
            value: c.id
          }))
        }
      ]);

      const { tables, container } = await engine.inspectContainer(containerId);
      console.log(CLIFormatter.formatSuccess(`Connected to ${container.name}`));

      if (tables.length === 0) {
        console.log(CLIFormatter.formatError('No tables found in this database.'));
        return;
      }

      const { tableName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'tableName',
          message: 'Select a table to view details:',
          choices: tables.map(t => t.name)
        }
      ]);

      const { schema, rows } = await engine.getFullSchema(containerId, tableName);

      console.log('\n' + CLIFormatter.formatSchemaTable(tableName, schema));
      console.log('\n' + CLIFormatter.formatDataPreview(rows));

      // View All Rows Feature
      const { viewAll } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'viewAll',
          message: 'Do you want to view all rows? (Warning: may be large)',
          default: false
        }
      ]);

      if (viewAll) {
        console.log(CLIFormatter.formatWarning('Fetching all rows...'));
        const allRows = await engine.getAllRows(containerId, tableName);
        console.log('\n' + CLIFormatter.formatDataPreview(allRows, `All Rows (${allRows.length})`));
      }

    } catch (error: any) {
      console.error(CLIFormatter.formatError(`Failed to inspect: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('web')
  .description('Start the web UI')
  .action(() => {
    console.log(CLIFormatter.formatHeader('Web UI coming soon!'));
  });

program.parse();
