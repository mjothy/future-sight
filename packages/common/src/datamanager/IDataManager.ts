import DataModel from '../models/DataModel';

export default interface IDataManager {
  getBaseUrl: () => string;

  getFilters: () => any; // {[id: string]: FilterObject}

  fetchPlotData: (data: DataModel[]) => Promise<any>;

  getFilterPossibleValues: (filter: any) => Promise<any> | undefined;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;

  browseData: (data: any) => Promise<any>;

  getOptions: () => string[];

  fetchDataOptions: (data: any) => Promise<any>;

  fetchDataFocusOptions: (data: any) => Promise<any>;

  fetchRegionsGeojson: (regions: string[]) => Promise<any>;
}
