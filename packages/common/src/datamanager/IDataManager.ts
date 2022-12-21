import DataModel from '../models/DataModel';
import PlotDataModel from "../models/PlotDataModel";

export default interface IDataManager {
  getBaseUrl: () => string;

  fetchPlotData: (data: DataModel[]) => Promise<PlotDataModel[]>;

  fetchFilter: (api_endpoint: string) => Promise<any>;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;

  browseData: (data: any) => Promise<any>;
}
