import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { join } from 'path';
import RedisClient from '../redis/RedisClient';
import IDataProxy from './IDataProxy';
import fetch from 'node-fetch';
import RegionsGeoJson from './RegionsGeoJson';

const optionsLabel = ["models", "scenarios", "variables", "regions"];
const COUNTRIES_GEOJSON_URL = "https://datahub.io/core/geo-countries/r/countries.geojson";

export default class ExpressServer {
  private app: any;
  private readonly port: number;
  private readonly auth: any;
  private readonly clientPath: any;
  private readonly dbClient: RedisClient;
  private readonly dataProxy: IDataProxy;

  constructor(
    port,
    cookieKey,
    auth,
    clientPath,
    dbClient,
    dataProxy: IDataProxy
  ) {
    this.app = express();
    this.port = port;
    this.auth = auth;
    this.clientPath = clientPath;
    this.dbClient = dbClient;
    this.dataProxy = dataProxy;
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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

    this.app.post('/api/plotData', (req, res) => {
      const body = req.body;
      const response: any[] = [];
      for (const reqData of body) {
        const elements = this.dataProxy.getData().filter(
          (e) => e.model === reqData.model && e.scenario === reqData.scenario && e.variable === reqData.variable && e.region === reqData.region
        );
        if (elements) {
          response.push(...elements);
        }
      }
      res.status(200).send(response);
    });

    this.app.get('/api/models', (req, res) => {
      res.send(this.dataProxy.getModels());
    });

    this.app.get('/api/scenarios', (req, res) => {
      res.send(this.dataProxy.getScenarios());
    });

    this.app.get(`/api/variables`, (req, res) => {
      res.send(this.dataProxy.getVariables());
    });

    this.app.get(`/api/regions`, (req, res) => {
      res.send(this.dataProxy.getRegions());
    });
    const appendDashboardIdToIndexList = async (id: string, indexListKey: string, value: string) => {
      // Initialize the key if it does not exist
      const valueTransform = value.replace(/ /g, '%');
      await this.dbClient.getClient().json.set(indexListKey, `.${valueTransform}`, [], {
        NX: true, // only set the key if it does not already exist
      });
      // Append the dashboard id to the list
      await this.dbClient
        .getClient()
        .json.arrAppend(indexListKey, `.${valueTransform}`, id);
    };

    // Posts methods
    this.app.post(`/api/dashboard/save`, async (req, res, next) => {
      try {
        const id = await this.dbClient.getClient().incr('dashboards:id');
        // Save the dashboard
        req.body.id = id; // change id
        await this.dbClient
          .getClient()
          .json.set('dashboards', `.${id}`, req.body);

        // Update the indexes
        for (const tag of req.body.userData.tags) {
          await appendDashboardIdToIndexList(id, 'tags', tag) // Set the tags indexes
        }
        // Set the authors indexes
        await appendDashboardIdToIndexList(id, 'authors', req.body.userData.author);
        res.send(JSON.stringify({ id: id }));
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.get(`/api/dashboards/:id`, async (req, res, next) => {
      try {
        const id = req.params.id;
        const dashboard = await this.dbClient
          .getClient()
          .json.get('dashboards', { path: [`.${id}`] });
        res.send(dashboard);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.get(`/api/dashboards`, async (req, res, next) => {
      try {
        const latestId = await this.dbClient.getClient().get('dashboards:id');
        const idsToFetch = [latestId];
        // Get the 5 last published dashboards
        for (let i = 1; i < 5; i++) {
          idsToFetch.push(latestId - i);
        }
        const dashboards: any[] = [];
        for (let i = latestId; i > latestId - 5; i--) {
          try {
            const dashboard = await this.dbClient
              .getClient()
              .json.get('dashboards', { path: i.toString() });
            dashboards.push(dashboard)
          } catch (e) {
            // no dashboard found for id
          }
        }

        res.send(dashboards);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.get('/api/browse/init', async (req, res, next) => {
      try {
        const data = await this.dbClient
          .getClient()
          .json.mGet(['authors', 'tags'], '.');
        // data is returned as: [ { author1: [], author2: [], ... }, { tag1: [], tag2: [], ... } ]
        const authors = data[0];
        const tags = data[1];
        const authorsTransform = {};
        const tagsTransform = {};
        Object.keys(authors).forEach(key => authorsTransform[key.replace(/%/g, ' ')] = authors[key])
        Object.keys(tags).forEach(key => tagsTransform[key.replace(/%/g, ' ')] = tags[key])
        res.send({ authors: authorsTransform, tags: tagsTransform });
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.post('/api/browse', async (req, res, next) => {
      try {
        const { dashboards } = req.body;
        const data = await this.dbClient
          .getClient()
          .json.get('dashboards', { path: dashboards.map(String) });
        let results = {}
        if (dashboards.length === 1) {
          results[dashboards[0]] = data;
        } else {
          results = Object.entries(data).reduce(
            (obj, [key, dashboard]) => Object.assign(obj, { [key]: dashboard }),
            {}
          );
        }

        res.send(results);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.post('/api/filterOptions', async (req, res, next) => {
      const firstFilters = req.body.filters;
      const metaData = req.body.metaData;
      const optionsData = {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      };
      const dataUnion = this.dataProxy.getDataUnion();
      let firstFilterRaws = dataUnion;

      // First filter (by data focus) -- only one filter selected
      Object.keys(firstFilters).forEach(option => {
        if (firstFilters[option].length > 0) {
          firstFilterRaws = dataUnion.filter(raw => firstFilters[option].includes(raw[option.slice(0, -1)]));
        }
      })

      const dataRaws = this.getRaws(metaData, firstFilterRaws);

      optionsLabel.forEach(option => {
        let possible_options: any[] = [];
        if (dataRaws[option].length > 0) {
          possible_options = Array.from(new Set(dataRaws[option].map(raw => raw[option.slice(0, -1)])))
        } else {
          possible_options = Array.from(new Set(firstFilterRaws.map(raw => raw[option.slice(0, -1)])))
        }
        optionsData[option] = possible_options;
      })

      res.send(optionsData);
    });

    this.app.post(`/api/regionsGeojson`, async (req, res) => {
      const regions = req.body.regions;
      const geojson = this.dataProxy.getGeojson(regions);
      res.send(geojson);
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

  /**
   * Get possible raws based on selected order in config.metaData.selectOrder
   * Exemple: selectOrder = [regions, models]
   * dataRaws[models] will contains all raws of selected regions
   * @param metaData the selected data in block
   * @param firstFilterRaws filtred raws based on data focus
   * @returns possible raws of {model,scenario,region,variable} in each index based on the before selection
   */
  getRaws = (metaData, firstFilterRaws) => {

    const dataRaws = {
      regions: [],
      variables: [],
      scenarios: [],
      models: [],
    };

    if (metaData.selectOrder.length > 0) {
      const option_unselected = optionsLabel.filter(option => !metaData.selectOrder.includes(option));
      const option_selected = metaData.selectOrder;

      // The first selection contains all raws
      const option = metaData.selectOrder[0];
      dataRaws[option] = firstFilterRaws;

      // set possible raws for selected inputs
      for (let i = 1; i < option_selected.length; i++) {
        const current_option = metaData.selectOrder[i];
        const prev_option = metaData.selectOrder[i - 1];
        dataRaws[current_option] = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
      }

      // set possible raws for unselected inputs
      if (option_unselected.length > 0) {
        const prev_option = metaData.selectOrder[metaData.selectOrder.length - 1];// last label selected (drop down)
        const possible_raws = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
        option_unselected.forEach((option) => {
          dataRaws[option] = possible_raws;
        })
      }
    }
    return dataRaws;
  }
}


