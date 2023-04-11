import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { join } from 'path';
import IPersistenceManager from '../interfaces/IPersistenceManager';
import { DashboardModel } from '@future-sight/common';
import BrowseObject from '../models/BrowseObject';
import IDataBackend from '../interfaces/IDataBackend ';
import IConfigurationProvider from '../interfaces/IConfigurationProvider';

export default class ExpressServer {
  private app: any;
  private readonly port: number;
  private readonly auth: any;
  private readonly clientPath: any;
  private readonly dbClient: IPersistenceManager;
  private readonly dataProxy: IDataBackend;
  private readonly configurationProvider: IConfigurationProvider;
  constructor(
    port,
    cookieKey,
    auth,
    clientPath,
    dbClient,
    dataProxy: IDataBackend,
    configurationProvider
  ) {
    this.app = express();
    this.port = port;
    this.auth = auth;
    this.clientPath = clientPath;
    this.dbClient = dbClient;
    this.dataProxy = dataProxy;
    this.configurationProvider = configurationProvider;
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

    this.app.get('/api/filters', (req, res) => {
      res.send(this.dataProxy.getFilters());
    });

    this.app.post('/api/filterValues', (req, res) => {
      res.send(this.dataProxy.getFilterPossibleValues(req.body.filterId));
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

    this.app.post('/api/dataFocus', async (req, res, next) => {
      const selectedData = req.body.data;
      const optionsData = this.dataProxy.getDataFocus(selectedData);

      // Get categories from file system
      // TODO add category to filter when request to iaasa is provided
      optionsData["categories"] = this.configurationProvider.getMetaIndicators();

      res.send(optionsData);
    });

    this.app.post('/api/filterOptions', async (req, res, next) => {

      try {
        const optionsData = this.dataProxy.getFilteredData(req.body.metaData, req.body.filters);
        optionsData["categories"] = this.configurationProvider.getMetaIndicators(); // TODO add categories to filter
        res.send(optionsData);
      } catch (err) {
        console.error(err);
        next(err);
      }
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
      res.send(this.configurationProvider.getMetaIndicators());
    });

    this.app.post(`/api/regionsGeojson`, async (req, res) => {
      const regions = req.body.regions;
      const geojson = this.configurationProvider.getGeojson(regions);
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
}