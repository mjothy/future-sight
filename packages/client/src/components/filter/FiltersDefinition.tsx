import FilterDefinitionModel from "@future-sight/common/build/models/FilterDefinitionModel";

const FILTERS_DEFINITION: {[id: string]: FilterDefinitionModel} = {
    models: {
        id: "models",
        id_singular: "model",
        label: "Models",
        label_singular: "Model",
        api_endpoint: "models"
    },
    scenarios: {
        id: "scenarios",
        id_singular: "scenario",
        label: "Scenarios",
        label_singular: "Scenario",
        api_endpoint: "scenarios"
    },
    variables: {
        id: "variables",
        id_singular: "variable",
        label: "Variables",
        label_singular: "Variable",
        api_endpoint: "variables"
    },
    regions: {
        id: "regions",
        id_singular: "region",
        label: "Regions",
        label_singular: "Region",
        api_endpoint: "regions"
    },
}

export default FILTERS_DEFINITION