import {
  IDataManager,
  ModelScenarioData,
  DataModel,
} from '@future-sight/common';

export default class DataManager implements IDataManager {
  getBaseUrl() {
    return '/api';
  }

  fetchData = (data: DataModel) => {
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

  fetchVariables = (data: ModelScenarioData) => {
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

  fetchRegions = (data: ModelScenarioData) => {
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
      body: JSON.stringify(data),
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

  saveDashboard = async (data) => {
    try {
      return await fetch(`${this.getBaseUrl()}/dashboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });
    } catch (err) {
      console.error(err);
    }
  };
}
