import Table from 'cli-table3';
import chalk from 'chalk';

export class CLIFormatter {
  /**
   * Format table list for selection
   */
  static formatHeader(text: string): string {
    return chalk.cyan.bold(`\n=== ${text} ===\n`);
  }

  static formatSuccess(text: string): string {
    return chalk.green(`✔ ${text}`);
  }

  static formatError(text: string): string {
    return chalk.red(`✘ ${text}`);
  }

  static formatWarning(text: string): string {
    return chalk.yellow(`⚠ ${text}`);
  }

  /**
   * Format database schema table
   */
  static formatSchemaTable(tableName: string, columns: any[]): string {
    const table = new Table({
      head: [
        chalk.blue('Column'),
        chalk.blue('Type'),
        chalk.blue('Nullable'),
        chalk.blue('Default')
      ],
      style: { head: [], border: [] }
    });

    columns.forEach(col => {
      table.push([
        col.column_name,
        col.data_type,
        col.is_nullable,
        col.column_default || chalk.dim('NULL')
      ]);
    });

    return `${chalk.yellow.bold(`Table: ${tableName}`)}\n${table.toString()}`;
  }

  /**
   * Format data preview table
   */
  static formatDataPreview(rows: any[], title: string = 'Preview (First 5 rows)'): string {
    if (rows.length === 0) return chalk.dim('No data found in table.');

    const head = Object.keys(rows[0]).map(h => chalk.green(h));
    const table = new Table({
      head,
      style: { head: [], border: [] }
    });

    rows.forEach(row => {
      table.push(Object.values(row).map(v => (v === null ? chalk.dim('NULL') : String(v))));
    });

    return `${chalk.yellow.bold(title)}\n${table.toString()}`;
  }
}
