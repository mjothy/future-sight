import ConfigurationModel from './ConfigurationModel';
import JsonConfigurationModel from './JsonConfigurationModel';
import TextConfigurationModel from './TextConfigurationModel';

export default class BlockModel {
  constructor(id = '', blockType?: string) {
    this.id = id;
    this.blockType = blockType;
    if (blockType === 'text') {
      this.config = new TextConfigurationModel();
    } else if (blockType === 'json') {
      this.config = new JsonConfigurationModel();
    } else {
      this.config = new ConfigurationModel();
    }
  }
  id: string;
  blockType: string | undefined;
  config: ConfigurationModel | TextConfigurationModel | JsonConfigurationModel;
  controlBlock = '';
}
