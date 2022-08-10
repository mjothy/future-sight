import ConfigurationModel from "./ConfigurationModel";

export default class BlockModel {
    blockType:string | undefined;
    config:ConfigurationModel[] = [];
    data = [];
    controlBlock: string | undefined;
}