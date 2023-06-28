import {versionModel} from "./BlockDataModel";

export default interface DataModel {
  model: string;
  scenario: string;
  region: string;
  variable: string;
  run?: versionModel;
}
