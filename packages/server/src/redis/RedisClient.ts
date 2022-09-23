import { createClient } from 'redis';

export default class RedisClient {
  private client: any;

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

  initialize = async () => {
    try {
      // init dashboards
      const dashboards = await this.client.json.get('dashboards');
      if (!dashboards) {
        await this.client.json.set('dashboards', '$', {});
      }

      // init authors
      const authors = await this.client.json.get('authors', '$');
      if (!authors) {
        const data = {};
        if (dashboards) {
          for (const [key, val] of Object.entries(dashboards)) {
            const value = val as any;
            const id = parseInt(key);
            if (data[value.userData.author]) {
              data[value.userData.author].add(id);
            } else {
              data[value.userData.author] = new Set([id]);
            }
          }
        }
        this.convertValue(data);
        await this.client.json.set('authors', '$', data);
      }

      // init tags
      const tags = await this.client.json.get('tags', '$');
      if (!tags) {
        const data = {};
        if (dashboards) {
          for (const [key, val] of Object.entries(dashboards)) {
            const value = val as any;
            const id = parseInt(key);
            value.userData.tags.forEach((tag) => {
              if (data[tag]) {
                data[tag].add(id);
              } else {
                data[tag] = new Set([id]);
              }
            });
          }
        }
        this.convertValue(data);
        await this.client.json.set('tags', '$', data);
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
