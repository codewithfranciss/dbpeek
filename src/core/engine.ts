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


  async inspectContainer(containerId: string): Promise<{
    tables: any[];
    container: DBContainerInfo;
  }> {
    const containers = await this.discoverDatabases();
    
    // Robust find: check for full ID match or prefix match (Docker often uses short IDs)
    const container = containers.find(c => 
      c.id === containerId || 
      c.id.startsWith(containerId) || 
      containerId.startsWith(c.id) ||
      c.name === containerId // Also try matching by name
    );
    
    if (process.env.DEBUG) console.log(`[PeekEngine] Lookup containerId: ${containerId}, Found: ${container?.name || 'Nothing'}`);
    
    if (!container) {
      const availableIds = containers.map(c => c.id).join(', ');
      throw new Error(`Container with ID "${containerId}" not found. Available database containers: [${availableIds}]`);
    }
    
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
    const containers = await this.discoverDatabases();
    const container = containers.find(c => 
      c.id === containerId || 
      c.id.startsWith(containerId) || 
      containerId.startsWith(c.id)
    );
    
    if (!container) throw new Error(`Container with ID "${containerId}" no longer found during schema fetch.`);
    
    const env = await this.detector.getContainerEnv(containerId);
    
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

  async getAllRows(containerId: string, tableName: string) {
    const containers = await this.discoverDatabases();
    const container = containers.find(c => 
      c.id === containerId || 
      c.id.startsWith(containerId) || 
      containerId.startsWith(c.id)
    );
    
    if (!container) throw new Error(`Container with ID "${containerId}" no longer found during row fetch.`);
    
    const env = await this.detector.getContainerEnv(containerId);
    
    const config: ConnectionConfig = {
      host: 'localhost',
      port: container?.ports[0] || 5432,
      user: env['POSTGRES_USER'] || 'postgres',
      password: env['POSTGRES_PASSWORD'] || '',
      database: env['POSTGRES_DB'] || env['POSTGRES_USER'] || 'postgres',
    };

    await this.postgres.connect(config);
    const rows = await this.postgres.getAllRows(tableName);
    await this.postgres.disconnect();

    return rows;
  }
}

