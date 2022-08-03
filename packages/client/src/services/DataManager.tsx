
export default class DataManager {
    url: string;
    port: number;

    constructor() {
      this.url = 'http://localhost'
      this.port = 8080;
    }

    getBaseUrl(){
      return this.url + ':'+this.port + '/api'
    }

    fetchData = (data) => {
      
      return fetch(`${this.getBaseUrl()}/data`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,

      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

    fetchModels = () => {
      return fetch(`${this.getBaseUrl()}/models`)
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

    fetchVariables = (data) => {
      return fetch(`${this.getBaseUrl()}/variables?model=${data.model}&scenario=${data.scenario}`)
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

    fetchRegions = (data) => {
      return fetch(`${this.getBaseUrl()}/regions?model=${data.model}&scenario=${data.scenario}`)
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

}