import DataModel from '../models/DataModel';
import PlotDataModel from "../models/PlotDataModel";

export default interface IDataManager {
  getBaseUrl: () => string;

  fetchPlotData: (data: DataModel[]) => Promise<PlotDataModel[]>;

  fetchModels: () => Promise<any>;

  fetchScenarios: () => Promise<any>;

  fetchVariables: () => Promise<any>;

  fetchRegions: () => Promise<any>;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;

  browseData: (data: any) => Promise<any>;

  getOptions: () => string[];

  fetchFilterOptions: (data: any) => Promise<any>;

  fetchDataFocusOptions: (data: any) => Promise<any>;

  fetchRegionsGeojson: (regions: string[]) => Promise<any>;

  fetchCategories: () => Promise<any>;
}
