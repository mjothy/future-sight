import ConfigurationModel from './ConfigurationModel';
import TextConfigurationModel from './TextConfigurationModel';

export default class BlockModel {
  constructor(id = '', blockType?: string) {
    this.id = id;
    this.blockType = blockType;
    if (blockType === 'text') {
      this.config = new TextConfigurationModel();
    } else {
      this.config = new ConfigurationModel();
    }
  }
  id: string;
  blockType: string | undefined;
  config: ConfigurationModel | TextConfigurationModel;
  controlBlock = '';
}
