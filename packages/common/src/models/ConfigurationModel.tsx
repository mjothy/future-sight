import BlockDataModel from './BlockDataModel';
import BlockStyleModel from './BlockStyleModel';
import FilterDefinitionModel from "./FilterDefinitionModel";

export default class ConfigurationModel {
  constructor(filtersDefinition: {[id: string]: FilterDefinitionModel}) {
    this.configStyle = new BlockStyleModel(filtersDefinition);
    this.metaData = new BlockDataModel(filtersDefinition);
  }

  configStyle: BlockStyleModel
  metaData: BlockDataModel
}
