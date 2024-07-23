import DataModel from '../models/DataModel';
import PlotDataModel from "../models/PlotDataModel";

export default interface IDataManager {
  getBaseUrl: () => string;

  getFilters: () => any; // {[id: string]: FilterObject}

  fetchPlotData: (data: DataModel[]) => Promise<PlotDataModel[]>;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any, username: string, password: string) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;

  browseData: (data: any) => Promise<any>;

  getOptions: () => any;

  fetchDocData: () => Promise<any>;

  fetchFilterOptions: (data: any) => Promise<any>;

  fetchMeta : () => Promise<any>;

  fetchDataFocusOptions: (data: any) => Promise<any>;

  fetchRegionsGeojson: (regions: string[]) => Promise<any>;

  checkUser: (username: string, password: string) => Promise<boolean>

}
