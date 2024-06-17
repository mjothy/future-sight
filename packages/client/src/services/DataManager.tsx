import type {DataModel, IDataManager, PlotDataModel} from '@future-sight/common';
import Utils from './Utils';

export default class DataManager implements IDataManager {
  getBaseUrl() {
    return '/api';
  }

  fetchDocData = async () : Promise<any> => {
    return await this.sendRequest("api/docData");
  }

  fetchPlotData = async (data: DataModel[]): Promise<PlotDataModel[]> => {
    return await this.sendRequest(`api/plotData`, data);
  };

  getFilters = () => {
    return fetch(`${this.getBaseUrl()}/filters`)
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
        return data;
      })
      .catch(console.error);
  };

  saveDashboard = async (data, username: string, password: string) => {
    data.date = new Date()
    const body = {
      dashboard: data,
      username: username,
      password: password
    };
    try {
      return await fetch(`${this.getBaseUrl()}/dashboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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

  getOptions = () => {
    return ["models", "scenarios", "variables", "regions"];
  };

  fetchFilterOptions = async (data) => {
    return await this.sendRequest(`api/filterOptions`, data);
  };

  fetchMeta = async () => {
    return await this.sendRequest(`api/meta`);
  };

  fetchDataFocusOptions = async (data) => {
    return await this.sendRequest(`api/dataFocus`, data);
  };

  fetchRegionsGeojson = (regions: string[]) => {
    return fetch(`api/regionsGeojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(regions),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch(console.error);
  };


  sendRequest = async (url, data?: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      const err: any = new Error();
      let message = "";
      err.status = response.status;
      if (err.status == 401) {
        err.message = "Server encountered an issue";
        message = "Error";
      } else {
        err.message = response.statusText;
      }

      Utils.showNotif(message, err.message);

      throw err;
    } else {
      return await response.json();
    }
  }

  checkUser = async (username: string, password: string) => {
    return await this.sendRequest("api/checkUser", {username, password});
  }
}


