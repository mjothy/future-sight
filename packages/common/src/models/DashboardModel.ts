import BlockModel from './BlockModel';
import DataStructureModel from './DataStructureModel';
import LayoutModel from './LayoutModel';
import UserDataModel from './UserDataModel';

import defaultJson from './dashboardModel.json'
import FilterDefinitionModel from "./FilterDefinitionModel";

export default class DashboardModel {
  constructor(filtersDefinition: {[id: string]: FilterDefinitionModel}, id?: string) {
    this.id = id;
    this.dataStructure = new DataStructureModel(filtersDefinition);
  }

  static fromDraft(filtersDefinition: {[id: string]: FilterDefinitionModel}, id?: string): DashboardModel {
    const ret = new DashboardModel(filtersDefinition, id)
    ret.layout = defaultJson.layout
    ret.blocks = {"1": new BlockModel("1", "data", filtersDefinition)}
    ret.date = new Date()
    return ret
  }

  id?: string;
  userData: UserDataModel = new UserDataModel();
  // Dict of data: keys are models
  dataStructure: DataStructureModel
  layout: LayoutModel[] = [];
  blocks: { [id: string]: BlockModel } = {};
  date?: Date |string;
}
