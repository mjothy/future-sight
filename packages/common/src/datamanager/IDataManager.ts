import ModelScenarioData from './ModelScenarioData';
import DataModel from '../models/DataModel';

export default interface IDataManager {
  getBaseUrl: () => string;

  fetchPlotData: (data: DataModel) => Promise<any>;

  fetchModels: () => Promise<any>;

  getDashboard: (id: string) => Promise<any>;

  getDashboards: () => Promise<any>;

  saveDashboard: (data: any) => Promise<any>;

  fetchBrowseInitData: () => Promise<any>;
}
