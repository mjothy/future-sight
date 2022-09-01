import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { join } from 'path';

import data from '../data/data.json';
import models from '../data/models.json';
import variables from '../data/variables.json';
import regions from '../data/regions.json';
import dashboard from '../data/dashboards.json';
import allData from '../data/test-data.json';

import * as fs from 'fs';
import RedisClient from '../redis/RedisClient';

import util from 'util';
const setTimeoutPromise = util.promisify(setTimeout);

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
    this.app.post(`/api/dashboard/save`, async (req, res, next) => {
      try {
        await setTimeoutPromise(1000);
        const id = await this.dbClient.getClient().incr('dashboards:id');
        await this.dbClient
          .getClient()
          .json.set('dashboards', `.${id}`, req.body);
        res.send(JSON.stringify({ id: id }));
      } catch (e) {
        next(e);
      }
    });

    this.app.post(`/api/dashboard`, (req, res) => {
      fs.writeFile('./dashboards.json', JSON.stringify(req.body), (err) => {
        if (err) console.log('Error writing file:', err);
      });
    });

    this.app.get(`/api/dashboard`, (req, res) => {
      res.send(dashboard);
    });

    /** START : To delete after Delete */

    // Prepare model data from the CSV file
    this.app.get(`/api/modelData`, (req, res) => {
      // get the models with scenarios
      const obj = {};
      allData.map((data) => {
        obj[data.Model] = {};
        allData.map((data2) => {
          if (data2.Model === data.Model) {
            if (obj[data.Model][data2.Scenario] == null) {
              obj[data.Model][data2.Scenario] = {
                variables: [],
                regions: [],
              };
            }
            obj[data.Model][data2.Scenario].variables.push(data2.Variable);
            obj[data.Model][data2.Scenario].regions.push(data2.Region);
            // uniques values:
            obj[data.Model][data2.Scenario].variables = [
              ...new Set(obj[data.Model][data2.Scenario].variables),
            ];
            obj[data.Model][data2.Scenario].regions = [
              ...new Set(obj[data.Model][data2.Scenario].regions),
            ];
          }
        });
      });
      fs.writeFile('./models1.json', JSON.stringify(obj), (err) => {
        console.log(err);
      });
    });

    // Prepare the data with timeseries
    this.app.get(`/api/allData`, (req, res) => {
      const result: any = [];
      allData.map((data) => {
        const obj: any = {
          model: data.Model,
          scenario: data.Scenario,
          region: data.Region,
          variable: data.Variable,
          unit: data.Unit,
          data: [],
        };
        for (let i = 2005; i <= 2100; i = i + 5) {
          const valStr = i.toString();
          if (data[valStr] == null) data[valStr] = '';
          const valObj = {
            year: i,
            value: data[valStr],
          };
          obj.data.push(valObj);
        }
        result.push(obj);
      });
      fs.writeFile('./result.json', JSON.stringify(result), (err) => {
        console.log(err);
      });
    });
    /** END : To delete after Delete */

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
