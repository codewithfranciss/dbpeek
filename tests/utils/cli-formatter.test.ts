import { CLIFormatter } from '../../src/utils/cli-formatter.js';

// Simple manual test script for the formatter
// Since we don't have a test runner configured yet, these can be run via ts-node or node
console.log('Testing CLIFormatter...');

const header = CLIFormatter.formatHeader('Test Header');
console.log(header);

const schemaTable = CLIFormatter.formatSchemaTable('users', [
  { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: "nextval('users_id_seq'::regclass)" },
  { column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null }
]);
console.log(schemaTable);

const dataPreview = CLIFormatter.formatDataPreview([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);
console.log(dataPreview);

console.log(CLIFormatter.formatSuccess('Formatter test complete.'));
