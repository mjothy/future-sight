import BlockDataModel from "./BlockDataModel";
import BlockStyleModel from "./BlockStyleModel";

export default class ConfigurationModel {
    configStyle:BlockStyleModel = new BlockStyleModel();
    metaData:BlockDataModel = new BlockDataModel();
}