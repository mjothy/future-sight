import FilterSelectionModel from "./FilterSelectionModel";
import FiltersDefinitionModel from "./FiltersDefinitionModel";


// TODO Pas très propre de faire ça non?
export default class DataStructureModel {
    constructor(filtersDefinition: FiltersDefinitionModel) {
        for (const key of Object.keys(filtersDefinition)) {
            this[key] = new FilterSelectionModel();
        }
    }
    [filter_id: string] : FilterSelectionModel
}
