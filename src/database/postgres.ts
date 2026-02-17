import { Client } from 'pg';

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export interface TableInfo {
  name: string;
}

export interface ConnectionConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export class PostgresInspector {
  private client: Client | null = null;

  async connect(config: ConnectionConfig): Promise<void> {
    this.client = new Client({
      ...config,
      connectionTimeoutMillis: 5000,
    });
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  /**
   * List all user tables in the public schema
   */
  async listTables(): Promise<TableInfo[]> {
    if (!this.client) throw new Error('Not connected');
    
    const res = await this.client.query(`
      SELECT table_name as name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    return res.rows;
  }

  /**
   * Get detail schema for a specific table
   */
  async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    if (!this.client) throw new Error('Not connected');

    const res = await this.client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, [tableName]);

    return res.rows;
  }

  /**
   * Preview first N rows of a table
   */
  async previewRows(tableName: string, limit: number = 5): Promise<any[]> {
    if (!this.client) throw new Error('Not connected');

    // Note: We use double quotes for table name to handle reserved words or case sensitivity
    const res = await this.client.query(`
      SELECT * FROM "${tableName}" LIMIT $1;
    `, [limit]);

    return res.rows;
  }
}
