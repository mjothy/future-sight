export default class LayoutModel {
  constructor(id: string, layoutModel ?: LayoutModel) {
    this.i = id;
    if(layoutModel != null){
      this.w = layoutModel.w;
      this.h = layoutModel.h;
      this.x = layoutModel.x;
      this.y = layoutModel.y;
    }
  }
  w = 4;
  h = 4;
  x = 0;
  y = 0;
  i = 'block';
}
