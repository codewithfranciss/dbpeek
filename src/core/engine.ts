import { DockerDetector, DBContainerInfo } from '../docker/detector';
import { PostgresInspector, ConnectionConfig } from '../database/postgres';

export class PeekEngine {
  private detector: DockerDetector;
  private postgres: PostgresInspector;

  constructor() {
    this.detector = new DockerDetector();
    this.postgres = new PostgresInspector();
  }

  async discoverDatabases(): Promise<DBContainerInfo[]> {
    return this.detector.getDatabaseContainers();
  }

  async inspectContainer(containerId: string): Promise<{
    tables: any[];
    container: DBContainerInfo;
  }> {
    const containers = await this.discoverDatabases();
    const container = containers.find(c => c.id === containerId);
    
    if (!container) throw new Error('Container not found');
    
    const env = await this.detector.getContainerEnv(containerId);
    
    // Build connection config
    const config: ConnectionConfig = {
      host: 'localhost', // Assume localhost for now
      port: container.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: env['POSTGRES_DB'] || env['POSTGRES_USER'] || 'postgres',
    };

    await this.postgres.connect(config);
    const tables = await this.postgres.listTables();
    await this.postgres.disconnect();

    return { tables, container };
  }

  async getFullSchema(containerId: string, tableName: string) {
    const env = await this.detector.getContainerEnv(containerId);
    const containers = await this.discoverDatabases();
    const container = containers.find(c => c.id === containerId);
    
    const config: ConnectionConfig = {
      host: 'localhost',
      port: container?.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: env['POSTGRES_DB'] || env['POSTGRES_USER'] || 'postgres',
    };

    await this.postgres.connect(config);
    const schema = await this.postgres.getTableSchema(tableName);
    const rows = await this.postgres.previewRows(tableName, 5);
    await this.postgres.disconnect();

    return { schema, rows };
  }
}
