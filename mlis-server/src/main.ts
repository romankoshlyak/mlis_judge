import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import express from 'express';

import AppServer from './AppServer';
import initDevData from './initDevData';

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log(path.join(__dirname, '../client_build'));
  app.use(express.static(path.join(__dirname, '../client_build')));
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client_build', 'index.html'));
  });
  const httpServer = http.createServer(app);
  const hostname = process.env.HOSTNAME;
  const privateKey  = fs.readFileSync(`./cert/${hostname}/server.key`, 'utf8');
  const certificate = fs.readFileSync(`./cert/${hostname}/server.crt`, 'utf8');
  const credentials = {key: privateKey, cert: certificate};
  const httpsServer = https.createServer(credentials, app);
  graphqlServer.installSubscriptionHandlers(httpServer);
  graphqlServer.installSubscriptionHandlers(httpsServer);
  httpServer.listen(8000);
  httpsServer.listen(8443);
  console.log('Server ready.');
}

main()
