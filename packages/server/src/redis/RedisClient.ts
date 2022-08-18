import { createClient } from 'redis';

export default class RedisClient {
  private client: any;
  
  constructor(url) {
    this.client = createClient({
      url: url,
    });

    this.client.on('error', this.onError);
  }

  startup = async () => {
    await this.client.connect();
  };

  onError = (err) => {
    console.log('Redis Client Error', err);
  };

  getClient = () => {
    return this.client;
  };
}
