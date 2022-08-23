import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { join } from 'path';

import data from '../data/data.json';
import models from '../data/models.json';
import variables from '../data/variables.json';
import regions from '../data/regions.json';
import dashboard from '../data/dashboards.json';

import * as fs from 'fs';
import RedisClient from '../redis/RedisClient';

export default class ExpressServer {
  private app: any;
  private readonly port: number;
  private readonly auth: any;
  private readonly clientPath: any;
  private readonly dbClient: RedisClient;

  constructor(port, cookieKey, auth, clientPath, dbClient) {
    this.app = express();
    this.port = port;
    this.auth = auth;
    this.clientPath = clientPath;
    this.dbClient = dbClient;
    this.app.use(bodyParser.json());
    if (auth) {
      this.app.use(this.auth);
    }
    this.app.use(cors());
    // Serve static resources from the "public" folder (ex: when there are images to display)
    this.app.use(express.static(join(__dirname, clientPath)));
    this.endpoints();
  }

  private endpoints = () => {
    this.app.get('/api/users/auth', (req, res) => {
      const options = {
        httpOnly: true,
        signed: true,
      };

      if (req.auth.user === 'admin') {
        res.cookie('name', 'admin', options).send({ screen: 'admin' });
      } else if (req.auth.user === 'user') {
        res.cookie('name', 'user', options).send({ screen: 'user' });
      }
      res.send({ auth: 'ok' });
    });

    this.app.get('/api', (req, res) => {
      res.send(`Hello , From server`);
    });

    this.app.post('/api/data', (req, res) => {
      const body = req.body;
      console.log('body: ', JSON.stringify(req.body));
      data.map((e) => {
        if (
          e.model === body.model &&
          e.scenario === body.scenario &&
          e.region === body.region &&
          e.variable === body.variable
        ) {
          res.status(200).send(e);
        }
      });
      res.status(404).send([]);
    });

    this.app.get('/api/models', (req, res) => {
      res.send(models);
    });

    this.app.get(`/api/variables`, (req, res) => {
      const model = req.query.model;
      const scenario = req.query.scenario;

      variables.forEach((variable) => {
        if (variable.model === model && variable.scenario === scenario)
          res.send({ ...variable });
      });

      res.status(404).send('No data found');
    });

    this.app.get(`/api/regions`, (req, res) => {
      const model = req.query.model;
      const scenario = req.query.scenario;

      let allRegions: any[] = [];
      regions.forEach((region) => {
        if (region.model === model && region.scenario === scenario)
          allRegions = [...allRegions, ...region.regions];
      });
      res.send(allRegions);
    });

    // Posts methods
    this.app.post(`/api/dashboard/save`, async (req, res) => {
      const data = JSON.parse(req.body);
      const id = await this.dbClient.getClient().incr('dashboards:id');
      // TODO: change id in data ?
      // await this.dbClient.getClient().json.arrAppend('dashboards', '.', data);
      res.send(id);
    });

    this.app.post(`/api/dashboard`, (req, res) => {
      fs.writeFile('./dashboards.json', JSON.stringify(req.body), (err) => {
        if (err) console.log('Error writing file:', err);
      });
    });

    this.app.get(`/api/dashboard`, (req, res) => {
      res.send(dashboard);
    });

    // Serve the HTML page
    this.app.get('*', (req: any, res: any) => {
      res.sendFile(join(__dirname, this.clientPath, 'index.html'));
    });
  };

  startup = () => {
    // start the Express server
    this.app.listen(this.port, () => {
      console.log(`app started at http://localhost:${this.port}`);
    });
  };
}
