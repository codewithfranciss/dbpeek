import Docker from 'dockerode';

export interface DBContainerInfo {
  id: string;
  name: string;
  image: string;
  type: 'postgres' | 'mysql' | 'unknown';
  status: string;
  ports: number[];
}

export class DockerDetector {
  private docker: Docker;

  constructor() {
    // Connect to local docker socket
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  /**
   * List all running database containers
   */
  async getDatabaseContainers(): Promise<DBContainerInfo[]> {
    const containers = await this.docker.listContainers();
    
    return containers
      .map(c => {
        const name = c.Names[0].replace('/', '');
        const image = c.Image.toLowerCase();
        let type: DBContainerInfo['type'] = 'unknown';

        if (image.includes('postgres')) {
          type = 'postgres';
        } else if (image.includes('mysql') || image.includes('mariadb')) {
          type = 'mysql';
        }

        return {
          id: c.Id,
          name,
          image: c.Image,
          type,
          status: c.State,
          ports: c.Ports.map(p => p.PublicPort).filter(Boolean) as number[]
        };
      })
      .filter(c => c.type !== 'unknown');
  }

  /**
   * Extract connection info from container environment variables
   */
  async getContainerEnv(containerId: string): Promise<Record<string, string>> {
    const container = this.docker.getContainer(containerId);
    const data = await container.inspect();
    const env = data.Config.Env || [];
    
    const envMap: Record<string, string> = {};
    env.forEach(e => {
      const [key, value] = e.split('=');
      envMap[key] = value;
    });
    
    return envMap;
  }
}
