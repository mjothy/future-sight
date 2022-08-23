import ModelScenarioData from './ModelScenarioData';
import DataModel from '../models/DataModel';

export default interface IDataManager {
  getBaseUrl: () => string;

  fetchData: (data: DataModel) => Promise<any>;

  fetchAllData: () => Promise<any>;

  fetchModels: () => Promise<any>;

  fetchVariables: (data: ModelScenarioData) => Promise<any>;

  fetchRegions: (data: ModelScenarioData) => Promise<any>;

  addDashboard: (data: DataModel) => Promise<any>;

  getDashboard: () => Promise<any>;
}
