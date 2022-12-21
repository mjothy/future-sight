export class FilterDefinitionModel {
    id = "";
    id_singular = "";
    label = "";
    label_singular = "";
    api_endpoint = "";
    isYAxisLabel = false;
}

export default class FiltersDefinitionModel {
    [id: string]: FilterDefinitionModel
}