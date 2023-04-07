import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { join } from 'path';
import IDataProxy from './IDataProxy';
import IPersistenceManager from '../redis/IPersistenceManager';
import { DashboardModel } from '@future-sight/common';
import BrowseObject from '../models/BrowseObject';

const optionsLabel = ["variables", "regions", "scenarios", "models",];

export default class ExpressServer {
  private app: any;
  private readonly port: number;
  private readonly auth: any;
  private readonly clientPath: any;
  private readonly dbClient: IPersistenceManager;
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

    // ===================
    //   IIASA calls
    // ===================
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

    this.app.post('/api/dataFocus', async (req, res, next) => {
      const selectedData = req.body.data;
      const optionsData = {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
        catagories: []
      };
      optionsLabel.forEach(option1 => {
        let dataUnion = this.dataProxy.getDataUnion();
        optionsLabel.forEach(option2 => {
          if (option1 != option2) {
            if (selectedData[option2].length > 0) {
              dataUnion = dataUnion.filter(raw => selectedData[option2].includes(raw[option2.slice(0, -1)]));
            }
          }
        })
        optionsData[option1] = Array.from(new Set(dataUnion.map(raw => raw[option1.slice(0, -1)])))
      })

      optionsData["categories"] = this.dataProxy.getCategories();

      res.send(optionsData);
    });

    this.app.post('/api/filterOptions', async (req, res, next) => {
      const firstFilters = req.body.filters;
      const metaData = req.body.metaData;
      const optionsData = {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
        catagories: []
      };
      const dataUnion = this.dataProxy.getDataUnion();
      let firstFilterRaws = dataUnion;

      let filterKeys = Object.keys(firstFilters);
      filterKeys = filterKeys.filter(key => key != "categories"); // TODO delete after
      // First filter (by data focus)
      filterKeys.forEach(option => {
        if (firstFilters[option].length > 0) {
          firstFilterRaws = firstFilterRaws.filter(raw => firstFilters[option].includes(raw[option.slice(0, -1)]));
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

      optionsData["categories"] = this.dataProxy.getCategories(); // TODO add categories to filter

      res.send(optionsData);
    });

    // ===================
    //   Redis calls
    // ===================

    this.app.post(`/api/dashboard/save`, async (req, res, next) => {
      try {
        const response = await this.dbClient.saveDashboard(req.body)
        res.send(response);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.get(`/api/dashboards/:id`, async (req, res, next) => {
      try {
        const id = req.params.id;
        const dashboard = await this.dbClient.getDashboardById(id);
        res.send(dashboard);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.get(`/api/dashboards`, async (req, res, next) => {
      try {
        const dashboards: DashboardModel[] = await this.dbClient.getAllDashboards();
        res.send(dashboards);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.get('/api/browse/init', async (req, res, next) => {
      try {
        const response: BrowseObject = await this.dbClient.getBrowseData();
        res.send(response);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });

    this.app.post('/api/browse', async (req, res, next) => {
      try {
        const { dashboards } = req.body;
        const response: { [id: number]: DashboardModel } = await this.dbClient.searchDashboard(dashboards)
        res.send(response);
      } catch (err) {
        console.error(err);
        next(err);
      }
    });


    // ===================
    //   System files
    // ===================

    this.app.get(`/api/categories`, (req, res) => {
      res.send(this.dataProxy.getCategories());
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
      catagories: []
    };

    metaData.selectOrder = metaData.selectOrder.filter(key => key != "categories"); // TODO delete after

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


