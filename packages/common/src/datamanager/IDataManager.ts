import DataModel from '../models/DataModel';

export default interface IDataManager {
  getBaseUrl: () => string;

  fetchPlotData: (data: DataModel) => Promise<any>;

  fetchFilter: (api_endpoint: string) => Promise<any>;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;

  browseData: (data: any) => Promise<any>;
}
