import type { IDataManager, DataModel, PlotDataModel } from '@future-sight/common';
import { BlockDataModel } from "@future-sight/common";
import { notification } from 'antd';

export default class DataManager implements IDataManager {
  getBaseUrl() {
    return '/api';
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

  saveDashboard = async (data) => {
    data.date = new Date()
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

  getOptions = () => {
    return ["models", "scenarios", "variables", "regions"];
  };

  fetchFilterOptions = async (data) => {
    return await this.sendRequest(`api/filterOptions`, data);
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
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) { // TODO add antd.notif
        const err: any = new Error();
        err.status = response.status;
        if (err.status == 401) {
          const resp_obj = await response.json();
          err.message = resp_obj.message;
        } else {
          err.message = response.statusText;
        }
        throw err;
      } else {
        const resp_obj = await response.json();
        return resp_obj;
      }
    } catch (err: any) { // TODO delete catch
      let message = "";
      if (err.status == 401) {
        message = "Access denied to ressources.";
      }
      notification.error({
        message: message,
        description: err.message,
        placement: 'top',
      });
      return []; // routing to login page
    }
  }

}
