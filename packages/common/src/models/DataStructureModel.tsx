import FilterSelectionModel from "./FilterSelectionModel";
import FilterDefinitionModel from "./FilterDefinitionModel";


// TODO Pas très propre de faire ça non?
export default class DataStructureModel {
    constructor(filtersDefinition: {[id: string]: FilterDefinitionModel}) {
        for (const key of Object.keys(filtersDefinition)) {
            this[key] = new FilterSelectionModel();
        }
    }
    [filter_id: string] : FilterSelectionModel
}
