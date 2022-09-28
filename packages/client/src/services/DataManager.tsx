import {
  IDataManager,
  ModelScenarioData,
  DataModel,
} from '@future-sight/common';

export default class DataManager implements IDataManager {
  getBaseUrl() {
    return '/api';
  }

  fetchPlotData = (data: DataModel) => {
    return fetch(`${this.getBaseUrl()}/plotData`, {
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
      .catch(console.error);
  };

  fetchModels = () => {
    return fetch(`${this.getBaseUrl()}/models`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch(console.error);
  };

  getDashboard = (id: string) => {
    return fetch(`${this.getBaseUrl()}/dashboards/${id}`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch(console.error);
  };

  getDashboards = () => {
    return fetch(`${this.getBaseUrl()}/dashboards`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch(console.error);
  };

  saveDashboard = async (data) => {
    try {
      return await fetch(`${this.getBaseUrl()}/dashboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => response.json());
    } catch (err) {
      console.error(err);
    }
  };

  fetchBrowseInitData = async () => {
    try {
      return await fetch(`${this.getBaseUrl()}/browse/init`).then((response) =>
        response.json()
      );
    } catch (err) {
      console.error(err);
    }
  };

  browseData = async (data) => {
    try {
      return await fetch(`${this.getBaseUrl()}/browse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => response.json());
    } catch (err) {
      console.error(err);
    }
  };
}
