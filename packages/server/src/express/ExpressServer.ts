import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { join } from 'path';
import IPersistenceManager from '../interfaces/IPersistenceManager';
import { DashboardModel, DataModel, OptionsDataModel } from '@future-sight/common';
import BrowseObject from '../models/BrowseObject';
import IDataBackend from '../interfaces/IDataBackend ';
import IConfigurationProvider from '../interfaces/IConfigurationProvider';
import {IAuthenticationBackend} from "../interfaces/IAuthenticationBackend ";

export default class ExpressServer {
  private app: any;
  private readonly port: number;
  private readonly auth: any;
  private readonly clientPath: any;
  private readonly dbClient: IPersistenceManager;
  private readonly dataProxy: IDataBackend;
  private readonly configurationProvider: IConfigurationProvider;
  private readonly authentication: IAuthenticationBackend;
  constructor(
    port,
    cookieKey,
    auth,
    clientPath,
    dbClient,
    dataProxy: IDataBackend,
    configurationProvider,
    authentication: IAuthenticationBackend
  ) {
    this.app = express();
    this.port = port;
    this.auth = auth;
    this.clientPath = clientPath;
    this.dbClient = dbClient;
    this.dataProxy = dataProxy;
    this.configurationProvider = configurationProvider;
    this.authentication = authentication;
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

    this.app.post('/api/checkUser', async (req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      let ok: boolean;
      try {
        let {access, refresh} = await this.authentication.queryToken(username, password);
        ok = !!access && !!refresh
      } catch {
        ok = false
      }
      res.status(200).send({ok: ok});
    });

    // ===================
    //   IIASA calls
    // ===================

    this.app.get('/api/filters', (req, res) => {
      res.send(this.dataProxy.getFilters());
    });

    this.app.post('/api/plotData', async (req, res) => {
      try {
        const selectedData: DataModel[] = req.body;
        const response = await this.dataProxy.getTimeSeries(selectedData);
        res.status(200).send(response);
      } catch (error: any) {
        if (error.status == 401) {
          res.status(401).send({ message: error.message });
        } else {
          console.error(error);
          res.status(error.status ? error.status : 500).send({ message: "Server error!!" });
        }
      }
    });

    // We call dataFocus afer each combo-box closed
    // 1- user open combobox of models,
    // 2- user select models = [model1,model2,...],
    // 3- close models combo-box
    // 4- re-fetch filterd values of [variables, regions, scenarions]
    this.app.post('/api/dataFocus', async (req, res, next) => {
      try {
        const selectedData = req.body.data;
        const filterIDs: string[] = req.body.filterIDs;
        const optionsData = await this.dataProxy.getDataFocus(selectedData, filterIDs);

        // Get categories from file system
        // TODO add category to filter when request to iaasa is provided
        optionsData["categories"] = this.configurationProvider.getMetaIndicators();

        res.send(optionsData);
      } catch (error: any) {
        console.error(error)
        if (error.status == 401) {
          res.status(401).send({ message: error.message });
        } else {
          console.error(error);
          res.status(error.status ? error.status : 500).send({ message: "Server error!!" });
        }
      }

    });

    this.app.post('/api/filterOptions', async (req, res, next) => {

      try {
        const optionsData = await this.dataProxy.getFilteredData(req.body.filterId, req.body.metaData, req.body.dataFocusFilters);
        optionsData["categories"] = this.configurationProvider.getMetaIndicators(); // TODO add categories to filter
        res.send(optionsData);
      } catch (error: any) {
        if (error.status == 401) {
          res.status(401).send({ message: error.message });
        } else {
          console.error(error);
          res.status(error.status ? error.status : 500).send({ message: "Server error!!" });
        }
      }
    });

    this.app.post('/api/meta', async (req, res, next) => {

      try {
        const data = await this.dataProxy.getMeta();
        res.send(data);
      } catch (error: any) {
        console.error("meta: ", error);
        if (error.status == 401) {
          res.status(401).send({ message: error.message });
        } else {
          res.status(error.status ? error.status : 500).send({ message: "Server error!!" });
        }
      }
    });

    // ===================
    //   Redis calls
    // ===================

    this.app.post(`/api/dashboard/save`, async (req, res, next) => {
      try {
        const dashboard = req.body.dashboard;
        const username = req.body.username;
        const password = req.body.password;
        if (!!username && !!password) {
          try {
            const authResponse = await this.authentication.queryToken(username, password);
            if(!!authResponse.access && !!authResponse.refresh) {
              dashboard.verified = true
            } else {
              dashboard.verified = false
            }
          } catch {
            dashboard.verified = false
          }
        }
        const response = await this.dbClient.saveDashboard(dashboard)
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
