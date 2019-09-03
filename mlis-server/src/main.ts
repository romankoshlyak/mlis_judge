import AppServer from './AppServer';
import initDevData from './initDevData';

async function main() {
  console.log('Server main');
  const server = new AppServer();
  await initDevData();
  const { url } = await server.listen();
  console.log(`Server ready at ${url}. `);
}

main()
