import BlockModel from './BlockModel';
import DataStructureModel from './DataStructureModel';
import LayoutModel from './LayoutModel';
import UserDataModel from './UserDataModel';

export default class DashboardModel {
  constructor(id?: string) {
    this.id = id;
  }

  static fromJson(json) : DashboardModel {
    const ret = new DashboardModel(json.id)
    ret.layout = json.layout
    ret.dataStructure = json.dataStructure
    ret.blocks = json.blocks
    ret.userData = UserDataModel.fromJson(json.userData)
    return ret
  }

  id?: string;
  userData: UserDataModel = new UserDataModel();
  // Dict of data: keys are models
  dataStructure: DataStructureModel = new DataStructureModel();
  layout: LayoutModel[] = [];
  blocks: { [id: string]: BlockModel } = {};
}
