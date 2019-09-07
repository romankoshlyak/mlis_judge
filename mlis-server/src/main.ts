import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import util from 'util';
import express from 'express';

import AppServer from './AppServer';
import initDevData from './initDevData';

const ENCODING = 'utf8';

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCredentials() {
  const hostname = process.env.HOSTNAME;
  const keyFileName = `./cert/${hostname}/server.key`;
  const crtFileName = `./cert/${hostname}/server.crt`;

  const keyFileExist = await util.promisify(fs.exists)(keyFileName);
  const crtFileExist = await util.promisify(fs.exists)(crtFileName);
  if (!keyFileExist || !crtFileExist) {
    console.log('Credentials file not found, https will not be supported');
    return null;
  }

  const privateKey  = await fs.promises.readFile(keyFileName, {encoding: ENCODING});
  const certificate = await fs.promises.readFile(crtFileName, {encoding: ENCODING});
  const credentials = {key: privateKey, cert: certificate};
  return credentials;
}
async function main() {
  console.log('Init data');
  while (true) {
    try {
      await initDevData();
      break;
    } catch {
      const waitingTime = 10;
      console.log(`Wating for ${waitingTime} seconds...`);
      await sleep(waitingTime * 1000);
    }
  }
  const graphqlServer = new AppServer();

  const app = express();
  graphqlServer.applyMiddleware({app});
  app.use(express.static(path.join(__dirname, '../client_build')));
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client_build', 'index.html'));
  });
  const httpServer = http.createServer(app);
  graphqlServer.installSubscriptionHandlers(httpServer);
  httpServer.listen(8000);
  const credentials = await loadCredentials();
  if (credentials != null) {
    const httpsServer = https.createServer(credentials, app);
    graphqlServer.installSubscriptionHandlers(httpsServer);
    httpsServer.listen(8443);
  }
  console.log('Server started');
}

main()
