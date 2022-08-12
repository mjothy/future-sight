import RedisClient from "./redis/RedisClient";
import ExpressServer from "./express/ExpressServer";
import basicAuth from 'express-basic-auth'

const DEFAULT_PORT = 8080
const DEFAULT_COOKIE_KEY = "8azoijuem2aois3Qsjeir"
const DEV_REDIS_URL = 'redis://localhost:6379'
// Environment parsing
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const port = process.env.PORT ? process.env.PORT : DEFAULT_PORT
const cookieKey = process.env.COOKIE_KEY ? process.env.COOKIE_KEY : DEFAULT_COOKIE_KEY
const clientPath = process.env.NODE_ENV ==='production' ? './public' : '../../../client/public';
const redisUrl = process.env.REDIS ? process.env.REDIS : DEV_REDIS_URL;
// redis initialisation
const redisClient = new RedisClient(redisUrl)

// Backend initialisation
let auth;
if (username && password ) {
    auth = basicAuth({
        users: { [username]: password },
        challenge: true
    })
}
const app = new ExpressServer(port, cookieKey, auth, clientPath)

// Startup
redisClient.startup().then(r => {
    app.startup()
})
