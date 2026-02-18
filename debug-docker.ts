import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function debug() {
  const containers = await docker.listContainers();
  console.log('Total containers found:', containers.length);
  
  containers.forEach(c => {
    console.log('---');
    console.log('Names:', c.Names);
    console.log('Image:', c.Image);
    console.log('ImageID:', c.ImageID);
    console.log('State:', c.State);
  });
}

debug().catch(console.error);
