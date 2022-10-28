import { createClient } from 'redis';

export default class RedisClient {
  private readonly client: any;

  constructor(url) {
    this.client = createClient({
      url: url,
    });

    this.client.on('error', this.onError);
  }

  /**
   * Convert the Set values in data to Arrays for persisting in Redis because Sets are persisted as {}
   * @param data
   */
  convertValue = (data) => {
    Object.keys(data).forEach((key) => {
      data[key] = Array.from(data[key]);
    });
  };

  /**
   * Initialize Redis keys
   * NB: dashboards:id is initialized in the /api/dashboard/save endpoint by the incr() call, no need to initialize this key here
   */
  initialize = async () => {
    try {
      // init dashboards
      await this.client.json.set('dashboards', '$', {}, {
        NX: true, // only set the key if it does not already exist
      });
      await this.client.json.set('authors', '$', {}, { NX: true }); // init the authors key
      await this.client.json.set('tags', '$', {}, { NX: true }); // init the tags key
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
