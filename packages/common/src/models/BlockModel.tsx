import ConfigurationModel from './ConfigurationModel';

export default class BlockModel {
  constructor(id?: string, blockType?: string) {
    this.id = id;
    this.blockType = blockType;
  }
  id: string | undefined;
  blockType: string | undefined;
  config: ConfigurationModel = new ConfigurationModel();
  controlBlock: string | undefined;
}
