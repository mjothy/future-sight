import BlockModel from './BlockModel';
import LayoutModel from './LayoutModel';
import UserDataModel from './UserDataModel';

export default class DashboardModel {
  constructor(id?: string) {
    this.id = id;
  }

  id?: string;
  userData: UserDataModel = new UserDataModel();
  // Dict of data: keys are models
  dataStructure: object = {};
  layout: LayoutModel[] = [];
  blocks: { [id: string]: BlockModel } = {};
}
