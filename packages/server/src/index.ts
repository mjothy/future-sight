import ExpressServer from './express/ExpressServer';
import basicAuth from 'express-basic-auth';
import path from "path";
import RedisPersistenceManager from './redis/RedisPersistenceManager';
import FSDataBackend from './data_backend/FSDataBackend';
import FSConfigurationProvider from './configurations/FSConfigurationProvider';
import IIASAAuthenticationBackend from './auth/IIASAAuthenticationBackend';
import IIASADataBackend from './data_backend/IIASADataBackend';
import * as fs from "fs";

const DEFAULT_PORT = 8080;
const DEFAULT_COOKIE_KEY = '8azoijuem2aois3Qsjeir';
const DEV_REDIS_URL = 'redis://localhost:6379';

// Data paths
const DEV_DATA_DIR = path.join(__dirname, "..", "..", "..", "data");

const DEV_DATA_PATH = path.join(DEV_DATA_DIR, "data.json");
const DEV_DATA_UNION_PATH = path.join(DEV_DATA_DIR, "dataUnion.json");
const DEV_COUNTRIES_GEOJSON_PATH = path.join(DEV_DATA_DIR, "countries.geojson");
const DEV_CATEGORIES_PATH = path.join(DEV_DATA_DIR, "categories.json");
const DEV_CONFIG_PATH = path.join(DEV_DATA_DIR, "config.json");

const PROD_DATA_DIR = path.join(__dirname, "data");
const PROD_DATA_PATH = path.join(PROD_DATA_DIR, "data.json");
const PROD_DATA_UNION_PATH = path.join(PROD_DATA_DIR, "dataUnion.json");
const PROD_COUNTRIES_GEOJSON_PATH = path.join(PROD_DATA_DIR, "countries.geojson");
const PROD_CATEGORIES_PATH = path.join(PROD_DATA_DIR, "categories.json");
const PROD_CONFIG_PATH = path.join(PROD_DATA_DIR, "config.json");

const isProd = process.env.NODE_ENV === 'production';
// Environment parsing
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const port = process.env.PORT ? process.env.PORT : DEFAULT_PORT;
const cookieKey = process.env.COOKIE_KEY ? process.env.COOKIE_KEY : DEFAULT_COOKIE_KEY;
const clientPath = isProd ? './public' : '../../../client/public';
let redisUrl = process.env.REDIS ? process.env.REDIS : DEV_REDIS_URL;

const dataPath = isProd ? PROD_DATA_PATH : DEV_DATA_PATH;
const dataUnionPath = isProd ? PROD_DATA_UNION_PATH : DEV_DATA_UNION_PATH;
const countriesGeojsonPath = isProd ? PROD_COUNTRIES_GEOJSON_PATH : DEV_COUNTRIES_GEOJSON_PATH;
const categoriesPath = isProd ? PROD_CATEGORIES_PATH : DEV_CATEGORIES_PATH;
const configPath = isProd ? PROD_CONFIG_PATH : DEV_CONFIG_PATH;

// Initialize configuration
const config_file = fs.readFileSync(configPath);
const config = JSON.parse(config_file.toString());
// Overide redis url if in conf
if("REDIS" in config) {
  redisUrl = config["REDIS"];
}

// data loading
let dataBackend;
const authentication = new IIASAAuthenticationBackend(config);
if (config.origin_data == "IIASA") {
  console.log("IIASA datasource");
  dataBackend = new IIASADataBackend(authentication);
} else {
  console.log("FS datasource");
  dataBackend = new FSDataBackend(dataPath, dataUnionPath);
}

const fsConfProvider = new FSConfigurationProvider(countriesGeojsonPath, categoriesPath);

// redis initialisation
const redisClient = new RedisPersistenceManager(redisUrl);

// Backend initialisation
let auth;

if (isProd) {
  if (username && password) {
    console.log("Basic auth activated");
    auth = basicAuth({
      users: { [username]: password },
      challenge: true,
    });
  }
}

const app = new ExpressServer(port, cookieKey, auth, clientPath, redisClient, dataBackend, fsConfProvider, authentication);

// Startup
redisClient.startup().then((r) => {
  app.startup();
});
