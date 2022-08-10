import { createClient } from 'redis';

const DEV_URL = 'redis://localhost:6379'

export default class RedisClient {
    private client: any;
    constructor(url= DEV_URL) {
        this.client = createClient({
            url: url
        });

        this.client.on('error', this.onError);
    }

    startup = async () => {
        await this.client.connect();
    }

    onError = (err) => {
        console.log('Redis Client Error', err)
    }
}
