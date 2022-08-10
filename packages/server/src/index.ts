import RedisClient from "./redis/RedisClient";
import ExpressServer from "./express/ExpressServer";

const redisClient = new RedisClient()
const app = new ExpressServer()
redisClient.startup().then(r => {
    app.startup()
})
