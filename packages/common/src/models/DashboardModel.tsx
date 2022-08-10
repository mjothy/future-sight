
import BlockModel from './BlockModel';
import LayoutModel from './LayoutModel';

export default class DashboardModel{

    id:string | undefined ;
    layout: LayoutModel[] = [];
    blocks: BlockModel[] = [];
    isPublished = false;
  
}
