import RedisClient from './redis/RedisClient';
import ExpressServer from './express/ExpressServer';
import basicAuth from 'express-basic-auth';
import FSDataProxy from "./express/FSDataProxy";
import path from "path";

const DEFAULT_PORT = 8080;
const DEFAULT_COOKIE_KEY = '8azoijuem2aois3Qsjeir';
const DEV_REDIS_URL = 'redis://localhost:6379';

// Data paths
const DEV_DATA_DIR = path.join(__dirname, "..", "..", "..", "data");
const DEV_DATA_PATH = path.join(DEV_DATA_DIR, "data.json");
const DEV_MODELS_PATH = path.join(DEV_DATA_DIR, "models.json");

const PROD_DATA_DIR = path.join(__dirname, "data");
const PROD_DATA_PATH = path.join(PROD_DATA_DIR, "data.json")
const PROD_MODELS_PATH = path.join(PROD_DATA_DIR, "models.json")

const isProd = process.env.NODE_ENV === 'production';
// Environment parsing
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const port = process.env.PORT ? process.env.PORT : DEFAULT_PORT;
const cookieKey = process.env.COOKIE_KEY ? process.env.COOKIE_KEY : DEFAULT_COOKIE_KEY;
const clientPath = isProd ? './public' : '../../../client/public';
const redisUrl = process.env.REDIS ? process.env.REDIS : DEV_REDIS_URL;

const dataPath = isProd ? PROD_DATA_PATH : DEV_DATA_PATH;
const modelsPath = isProd ? PROD_MODELS_PATH : DEV_MODELS_PATH;

// data loading
const dataProxy = new FSDataProxy(dataPath, modelsPath);

// redis initialisation
const redisClient = new RedisClient(redisUrl);

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
