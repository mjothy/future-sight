import {MetaModel} from "./BlockDataModel";

export default class OptionsDataModel {

    regions: string[] = [];
    variables: string[] = [];
    scenarios: string[] = [];
    models: string[] = [];
    versions: any[] = [];
    metaIndicators: MetaModel = {};
}