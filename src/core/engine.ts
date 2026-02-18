import { DockerDetector, DBContainerInfo } from '../docker/detector.js';
import { PostgresInspector, ConnectionConfig } from '../database/postgres.js';

export class PeekEngine {
  private detector: DockerDetector;
  private postgres: PostgresInspector;

  constructor() {
    this.detector = new DockerDetector();
    this.postgres = new PostgresInspector();
  }

  async discoverDatabases(): Promise<DBContainerInfo[]> {
    const list = await this.detector.getDatabaseContainers();
    if (process.env.DEBUG) console.log(`[PeekEngine] Discovered ${list.length} database containers:`, list.map(c => c.name).join(', '));
    return list;
  }

  async findContainer(containerId: string): Promise<DBContainerInfo> {
    const containers = await this.discoverDatabases();
    const container = containers.find(c => 
      c.id === containerId || 
      c.id.startsWith(containerId) || 
      containerId.startsWith(c.id) ||
      c.name === containerId
    );
    
    if (!container) {
      const availableIds = containers.map(c => c.id).join(', ');
      throw new Error(`Container with ID/name "${containerId}" not found. Available database containers: [${availableIds}]`);
    }

    return container;
  }

  async discoverDatabasesInContainer(containerId: string): Promise<string[]> {
    const container = await this.findContainer(containerId);
    const env = await this.detector.getContainerEnv(container.id);
    
    const config: ConnectionConfig = {
      host: 'localhost',
      port: container.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: 'postgres', // Connect to default to list others
    };

    await this.postgres.connect(config);
    const dbs = await this.postgres.listDatabases();
    await this.postgres.disconnect();

    return dbs;
  }

  async inspectContainer(containerId: string, databaseName?: string): Promise<{
    tables: any[];
    container: DBContainerInfo;
  }> {
    const container = await this.findContainer(containerId);
    const env = await this.detector.getContainerEnv(container.id);
    
    // Build connection config
    const config: ConnectionConfig = {
      host: 'localhost',
      port: container.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: databaseName || env['POSTGRES_DB'] || env['POSTGRES_USER'] || 'postgres',
    };

    await this.postgres.connect(config);
    const tables = await this.postgres.listTables();
    await this.postgres.disconnect();

    return { tables, container };
  }

  async getFullSchema(containerId: string, tableName: string, databaseName?: string) {
    const container = await this.findContainer(containerId);
    const env = await this.detector.getContainerEnv(container.id);
    
    const config: ConnectionConfig = {
      host: 'localhost',
      port: container.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: databaseName || env['POSTGRES_DB'] || env['POSTGRES_USER'] || 'postgres',
    };

    await this.postgres.connect(config);
    const schema = await this.postgres.getTableSchema(tableName);
    const rows = await this.postgres.previewRows(tableName, 5);
    await this.postgres.disconnect();

    return { schema, rows };
  }

  async getAllRows(containerId: string, tableName: string, databaseName?: string) {
    const container = await this.findContainer(containerId);
    const env = await this.detector.getContainerEnv(container.id);
    
    const config: ConnectionConfig = {
      host: 'localhost',
      port: container.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: databaseName || env['POSTGRES_DB'] || env['POSTGRES_USER'] || 'postgres',
    };

    await this.postgres.connect(config);
    const rows = await this.postgres.getAllRows(tableName);
    await this.postgres.disconnect();

    return rows;
  }
}
