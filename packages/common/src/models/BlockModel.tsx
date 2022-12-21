import ConfigurationModel from './ConfigurationModel';
import TextConfigurationModel from './TextConfigurationModel';
import FiltersDefinitionModel from "./FiltersDefinitionModel";

export default class BlockModel {
  constructor(id?: string, blockType?: string, filtersDefinition?: FiltersDefinitionModel) {
    this.id = id;
    this.blockType = blockType;
    if (blockType === 'text') {
      this.config = new TextConfigurationModel();
    } else {
      if (filtersDefinition){
        this.config = new ConfigurationModel(filtersDefinition);
      } else {
        throw new Error("Block is not of type text or was not provided filtersDefinition")
      }
    }
  }
  id: string | undefined;
  blockType: string | undefined;
  config: ConfigurationModel | TextConfigurationModel;
  controlBlock = '';
}
