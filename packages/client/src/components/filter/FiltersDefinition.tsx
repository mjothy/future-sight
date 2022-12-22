import FiltersDefinitionModel from "@future-sight/common/build/models/FiltersDefinitionModel";
import {BranchesOutlined, ControlOutlined, GlobalOutlined, LineChartOutlined} from "@ant-design/icons";

const FILTERS_DEFINITION: FiltersDefinitionModel = {
    models: {
        id: "models",
        id_singular: "model",
        label: "Models",
        label_singular: "Model",
        api_endpoint: "models",
        isYAxisLabel: false,
        icon: <ControlOutlined/>
    },
    scenarios: {
        id: "scenarios",
        id_singular: "scenario",
        label: "Scenarios",
        label_singular: "Scenario",
        api_endpoint: "scenarios",
        isYAxisLabel: false,
        icon: <BranchesOutlined/>
    },
    variables: {
        id: "variables",
        id_singular: "variable",
        label: "Variables",
        label_singular: "Variable",
        api_endpoint: "variables",
        isYAxisLabel: true,
        icon: <LineChartOutlined/>
    },
    regions: {
        id: "regions",
        id_singular: "region",
        label: "Regions",
        label_singular: "Region",
        api_endpoint: "regions",
        isYAxisLabel: false,
        icon: <GlobalOutlined/>
    },
}

export default FILTERS_DEFINITION