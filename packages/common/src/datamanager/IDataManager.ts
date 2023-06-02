import DataModel from '../models/DataModel';
import PlotDataModel from "../models/PlotDataModel";

export default interface IDataManager {
  getBaseUrl: () => string;

  getFilters: () => any; // {[id: string]: FilterObject}

  fetchPlotData: (data: DataModel[]) => Promise<PlotDataModel[]>;

  getFilterPossibleValues: (filter: any) => Promise<any> | undefined;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;

  browseData: (data: any) => Promise<any>;

  getOptions: () => any;

  fetchFilterOptions: (data: any) => Promise<any>;

  fetchDataFocusOptions: (data: any) => Promise<any>;

  fetchRegionsGeojson: (regions: string[]) => Promise<any>;
}
