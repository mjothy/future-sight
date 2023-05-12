import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {join} from 'path';
import RedisClient from '../redis/RedisClient';
import IDataProxy from './IDataProxy';

const optionsLabel = ["models", "scenarios", "variables", "regions", "versions"];

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
        let elements = this.dataProxy.getData()
        // TODO VERSION
        if (reqData.version){
          elements = elements.filter(
              (e) => e.model === reqData.model && e.scenario === reqData.scenario && e.variable === reqData.variable && e.region === reqData.region && e.version === reqData.version
          );
        } else {
          elements = elements.filter(
            (e) => e.model === reqData.model && e.scenario === reqData.scenario && e.variable === reqData.variable && e.region === reqData.region && e.is_default === "True"
          );
        }
        if (elements) {
          response.push(...elements);
        }
      }
      res.status(200).send(response);
    });

    this.app.get('/api/all_data', (req, res) => {
      res.send(this.dataProxy.getDataUnion()[0]);
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

    this.app.get(`/api/categories`, (req, res) => {
      res.send(this.dataProxy.getCategories());
    });

    this.app.post('/api/dataFocus', async (req, res, next) => {
      const selectedData = req.body.data;
      const optionsData = {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      };
      Object.keys(optionsData).forEach(option1 => {
        let dataUnion = this.dataProxy.getDataUnion();
        Object.keys(optionsData).forEach(option2 => {
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
      const filterId = req.body.filterId
      const dataFocusFilters = req.body.dataFocusFilters;
      const metaData = req.body.metaData;
      const optionsData = {};
      const dataUnion = this.dataProxy.getDataUnion();

      if (
          filterId === "versions"
          && !["models", "scenarios"].every(item => metaData.selectOrder.includes(item))
      ) {
        const err = "Both models and scenarios should be chosen before asking for versions"
        console.error(err);
        res.status(400).send(new Error(err));
      }

      // First filter (by data focus) -- only one filter selected
      let dataFocusFiltersRaws = dataUnion;
      Object.keys(dataFocusFilters).forEach(option => {
        if (option === "categories"){ // TODO delete after
          return
        }

        if (dataFocusFilters[option].length > 0) {
          dataFocusFiltersRaws = dataFocusFiltersRaws.filter(raw => dataFocusFilters[option].includes(raw[option.slice(0, -1)]));
        }
      })

      // Filter by selection
      const dataRaws = this.getRawsByFilterId(filterId, metaData, dataFocusFiltersRaws);

      if (filterId === "versions"){
        optionsData["versions"] = this.getVersionDictFromRaws(dataRaws);
      } else {
        optionsData[filterId] = Array.from(new Set(dataRaws.map(raw => raw[filterId.slice(0, -1)])))
      }

      // TODO add categories to filter
      if(filterId === "categories"){
        optionsData["categories"] = this.dataProxy.getCategories();
      }

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
   * dataRaws[models] will contain all raws of selected regions
   * @param filterId the filter which updates its options
   * @param metaData the selected data in block
   * @param dataFocusFiltersRaws filtred raws based on data focus
   * @returns possible raws of {model,scenario,region,variable} in each index based on the before selection
   */
  getRawsByFilterId = (filterId, metaData, dataFocusFiltersRaws) => {
    // Get filterToApply
    const filtersToApply = this.getFiltersToApply(filterId, metaData)

    // The first selection contains all raws
    let dataRaws = dataFocusFiltersRaws;

    // Filter by filters with lower idx
    for (const tempFilter of filtersToApply) {
      dataRaws = (tempFilter === "versions")
          ? this.filterRawByVersions(dataRaws, metaData)
          : dataRaws.filter(raw => metaData[tempFilter].includes(raw[tempFilter.slice(0, -1)]));
    }

    return dataRaws;
  }

  /**
   * Get filters that has to be used on this filterId (filters that have a lower idx in selectOrder)
   * Special case when scenario and models are in selectOrder, the last selected is replaced by versions and runId
   * in the future to always filter by versions/runId after scenarios or models
   * @param filterId the filter which updates its options
   * @param metaData the selected data in block
   * @returns a list of filterId to be applied
   */
  getFiltersToApply(filterId, metaData){

    let lowerIdxFilters;

    if (filterId === "versions"){
      // Get all filters with idx <= idx(models) and idx(scenarios)
      const maxIdx = Math.max(metaData.selectOrder.indexOf("models"), metaData.selectOrder.indexOf("scenarios"))
      lowerIdxFilters=  metaData.selectOrder.slice(0, maxIdx+1) // TODO replace by runId here
    }
    else{
      const filterIdOrder = metaData.selectOrder.indexOf(filterId)
      lowerIdxFilters = filterIdOrder<0
          ? [...metaData.selectOrder] // filterId not in selectOrder, all selectOrder have lower idx
          : metaData.selectOrder.slice(0, filterIdOrder) // only filters with idx lower than filterIdOrder

      // Replace scenarios or models by versions if both in selectOrder, choose the highest idx between them.
      // As it is the same to filter by model/scenario/version or to filter by runId
      // when both scenario and model are selected
      if(["models", "scenarios"].every(item => metaData.selectOrder.includes(item))){
        const maxIdx = Math.max(metaData.selectOrder.indexOf("models"), metaData.selectOrder.indexOf("scenarios"))
        lowerIdxFilters.splice(maxIdx+1, 0, "versions") // TODO replace by runId here
      }
    }
    return lowerIdxFilters
  }

  /**
   * Filter by versions. Versions are stored differently hence a different function than other filters
   * @param dataRaws rows of data to filter
   * @param metaData the selected data in block
   * @returns a dataRaws filtered by versions/runId in the future
   */
  filterRawByVersions(dataRaws, metaData) {
    const selectedVersions = metaData.versions
    return dataRaws.filter(raw => {
      if(!!selectedVersions[raw.model]
          && !!selectedVersions[raw.model][raw.scenario]
          && selectedVersions[raw.model][raw.scenario].length>0
      ){
        return selectedVersions[raw.model][raw.scenario].includes(raw.version)
      } else {
        // No selection so select default
        return raw.is_default
      }
    });
  }

  /**
   * Transform dataRaws into a versionDict format
   * @param dataRaws rows of data
   * @returns a dict in format dict[model][scenario]: versionId[]
   */
  getVersionDictFromRaws(dataRaws){
    const version_dict = {};
    for (const raw of dataRaws) {
      !(raw["model"] in version_dict) && (version_dict[raw.model]={});
      !(raw["scenario"] in version_dict[raw["model"]]) && (version_dict[raw["model"]][raw["scenario"]] = {default: "", values:[]});
      (raw["is_default"] == "True") && (version_dict[raw["model"]][raw["scenario"]].default=raw["version"]);
      !(version_dict[raw.model][raw.scenario].values.includes(raw.version)) && (version_dict[raw.model][raw.scenario].values.push(raw.version));
    }
    return version_dict
  }

}
