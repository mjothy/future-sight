import { createClient } from 'redis';

export default class RedisClient {
  private client: any;

  constructor(url) {
    this.client = createClient({
      url: url,
    });

    this.client.on('error', this.onError);
  }

  initialize = async () => {
    try {
      const dashboards = await this.client.json.get('dashboards', '$');
      if (!dashboards) {
        await this.client.json.set('dashboards', '$', {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  startup = async () => {
    await this.client.connect();
    await this.initialize();
  };

  onError = (err) => {
    console.log('Redis Client Error', err);
  };

  getClient = () => {
    return this.client;
  };
}
