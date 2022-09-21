import BlockModel from './BlockModel';
import LayoutModel from './LayoutModel';
import UserDataModel from './UserDataModel';

import defaultJson from './dashboardModel.json'

export default class DashboardModel {
  constructor(id?: string) {
    this.id = id;
  }

  static fromDraft(id?: string) : DashboardModel {
    const ret = new DashboardModel(id)
    ret.layout = defaultJson.layout
    ret.blocks = defaultJson.blocks
    return ret
  }

  id?: string;
  userData: UserDataModel = new UserDataModel();
  // Dict of data: keys are models
  dataStructure: object = {};
  layout: LayoutModel[] = [];
  blocks: { [id: string]: BlockModel } = {};
}
