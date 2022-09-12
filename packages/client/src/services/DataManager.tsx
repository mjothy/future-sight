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
      .catch(console.error);
  };

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
      .catch(console.error);
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
      .catch(console.error);
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
        // Reverse the order as the lastest publications have the greatest ids
        return Object.keys(data)
          .reverse()
          .reduce((obj, id) => {
            // As the id is a number, we add a dot to the id otherwise the browser may not key the insertion order
            obj[`${id}.`] = data[id];
            return obj;
          }, {});
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
      });
    } catch (err) {
      console.error(err);
    }
  };
}
