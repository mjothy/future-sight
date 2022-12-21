import BlockDataModel from './BlockDataModel';
import BlockStyleModel from './BlockStyleModel';
import FiltersDefinitionModel from "./FiltersDefinitionModel";

export default class ConfigurationModel {
  constructor(filtersDefinition: FiltersDefinitionModel) {
    this.configStyle = new BlockStyleModel(filtersDefinition);
    this.metaData = new BlockDataModel(filtersDefinition);
  }

  configStyle: BlockStyleModel
  metaData: BlockDataModel
}
