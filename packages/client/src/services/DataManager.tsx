export default class DataManager {

  getBaseUrl(){
    return '/api'
  }

  fetchData = (data) => {
    return fetch(`${this.getBaseUrl()}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };

  fetchAllData = () => {
    return fetch(`${this.getBaseUrl()}/data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };

  fetchModels = () => {
    return fetch(`${this.getBaseUrl()}/models`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };

  fetchVariables = (data) => {
    return fetch(
      `${this.getBaseUrl()}/variables?model=${data.model}&scenario=${
        data.scenario
      }`
    )
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };

  fetchRegions = (data) => {
    return fetch(
      `${this.getBaseUrl()}/regions?model=${data.model}&scenario=${
        data.scenario
      }`
    )
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };

  addDashboard = (data) => {
    return fetch(`${this.getBaseUrl()}/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };

  getDashboard = () => {
    return fetch(`${this.getBaseUrl()}/dashboard`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((err) => err);
  };
}
