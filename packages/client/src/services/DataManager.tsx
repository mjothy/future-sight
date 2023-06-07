import type { IDataManager, DataModel, PlotDataModel } from '@future-sight/common';
import { BlockDataModel } from "@future-sight/common";

export default class DataManager implements IDataManager {
  getBaseUrl() {
    return '/api';
  }

  fetchPlotData = (data: DataModel[]): Promise<PlotDataModel[]> => {
    return fetch(`${this.getBaseUrl()}/plotData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((plotData) => {
        return plotData;
      })
      .catch(console.error);
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

  fetchFilterOptions = (data) => {
    return fetch(`api/filterOptions`, {
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


  fetchDataFocusOptions = (data) => {
    return fetch(`api/dataFocus`, {
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

}
