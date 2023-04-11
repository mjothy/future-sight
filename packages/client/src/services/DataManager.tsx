import type { IDataManager, DataModel } from '@future-sight/common';

export default class DataManager implements IDataManager {
  getBaseUrl() {
    return '/api';
  }

  fetchPlotData = (data: DataModel[]) => {
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

  getFilters = () => {
    return fetch(`${this.getBaseUrl()}/filters`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch(console.error);
  };

  getFilterPossibleValues = (filter: any) => {
    console.log("filter: ", filter)
    switch (filter.origin) {
      case "iaasa": return fetch(`${this.getBaseUrl()}/filterValues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterId: filter.id
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(console.error);

      case "fs": return fetch(`${this.getBaseUrl()}${filter.path}`)
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(console.error);

      default: console.error("Error filter !");
    }


  }

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

  fetchDataOptions = (data) => {
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
