import RedisClient from './redis/RedisClient';
import ExpressServer from './express/ExpressServer';
import basicAuth from 'express-basic-auth';
import FSDataProxy from "./express/FSDataProxy";
import path from "path";
import RedisPersistenceManager from './redis/RedisPersistenceManager';

const DEFAULT_PORT = 8080;
const DEFAULT_COOKIE_KEY = '8azoijuem2aois3Qsjeir';
const DEV_REDIS_URL = 'redis://localhost:6379';

// Data paths
const DEV_DATA_DIR = path.join(__dirname, "..", "..", "..", "data");

const DEV_DATA_PATH = path.join(DEV_DATA_DIR, "data.json");
const DEV_DATA_UNION_PATH = path.join(DEV_DATA_DIR, "dataUnion.json");
const DEV_COUNTRIES_GEOJSON_PATH = path.join(DEV_DATA_DIR, "countries.geojson");
const DEV_CATEGORIES_PATH = path.join(DEV_DATA_DIR, "categories.json");

const PROD_DATA_DIR = path.join(__dirname, "data");
const PROD_DATA_PATH = path.join(PROD_DATA_DIR, "data.json");
const PROD_DATA_UNION_PATH = path.join(PROD_DATA_DIR, "dataUnion.json");
const PROD_COUNTRIES_GEOJSON_PATH = path.join(PROD_DATA_DIR, "countries.geojson");
const PROD_CATEGORIES_PATH = path.join(PROD_DATA_DIR, "categories.json");

const isProd = process.env.NODE_ENV === 'production';
// Environment parsing
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const port = process.env.PORT ? process.env.PORT : DEFAULT_PORT;
const cookieKey = process.env.COOKIE_KEY ? process.env.COOKIE_KEY : DEFAULT_COOKIE_KEY;
const clientPath = isProd ? './public' : '../../../client/public';
const redisUrl = process.env.REDIS ? process.env.REDIS : DEV_REDIS_URL;

const dataPath = isProd ? PROD_DATA_PATH : DEV_DATA_PATH;
const dataUnionPath = isProd ? PROD_DATA_UNION_PATH : DEV_DATA_UNION_PATH;
const countriesGeojsonPath = isProd ? PROD_COUNTRIES_GEOJSON_PATH : DEV_COUNTRIES_GEOJSON_PATH;
const categoriesPath = isProd ? PROD_CATEGORIES_PATH : DEV_CATEGORIES_PATH;

// data loading
const dataProxy = new FSDataProxy(dataPath, dataUnionPath, countriesGeojsonPath, categoriesPath);

// redis initialisation
// const redisClient = new RedisClient(redisUrl);
const redisClient = new RedisPersistenceManager(redisUrl);
// Backend initialisation
let auth;
if (username && password) {
  auth = basicAuth({
    users: { [username]: password },
    challenge: true,
  });
}
const app = new ExpressServer(port, cookieKey, auth, clientPath, redisClient, dataProxy);

// Startup
redisClient.startup().then((r) => {
  app.startup();
});
