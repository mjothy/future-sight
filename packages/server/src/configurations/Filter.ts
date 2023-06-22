
// TODO add interface
// TODO add run Ids to variable and region body
import {versionsModel} from "@future-sight/common/build/models/BlockDataModel";

export default class Filter {

    private body = {};
    private selectOrder?: string[];
    private dataFocusFilters?: any;
    constructor(globalSelectedData, dataFocusFilters?: any, selectOrder?: string[]) {
        this.selectOrder = selectOrder;
        this.dataFocusFilters = dataFocusFilters;
        this.body = {
            "models": this.modelBody(globalSelectedData),
            "scenarios": this.scenarioBody(globalSelectedData),
            "regions": this.regionsBody(globalSelectedData),
            "variables": this.variableBody(globalSelectedData),
            "units": this.unitsBody(globalSelectedData),
            "runs": this.runBody(globalSelectedData)
        };
    }

    getBody = (filterId) => {
        return this.body[filterId] != null ? this.body[filterId] : {};
    }

    regionsBody = (globalSelectedData) => {
        const filtersToApply = this.getFiltersToApply("regions", this.selectOrder);
        let selectedData = this.getSelectedDataOfFilter(globalSelectedData, filtersToApply);
        selectedData = this.addDataFocusToSelectedData(selectedData);

        const requestBody: FilterSchema = {};

        if (selectedData["variables"]?.length > 0) {
            requestBody.variable = { name__in: selectedData["variables"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (Object.keys(selectedData["versions"] || {})?.length>0) {
            requestBody.run = {
                id__in: this.getRunIdsFromVersionsModel(selectedData["versions"])
            };
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.run = {
                scenario: { name__in: selectedData["scenarios"] }
            };
        }

        if (selectedData["models"]?.length > 0) {
            requestBody.run = {
                model: { name__in: selectedData["models"] }
            };
        }

        return requestBody;

    }

    variableBody = (globalSelectedData) => {
        const filtersToApply = this.getFiltersToApply("variables", this.selectOrder);
        let selectedData = this.getSelectedDataOfFilter(globalSelectedData, filtersToApply);
        selectedData = this.addDataFocusToSelectedData(selectedData);
        const requestBody: FilterSchema = {};

        if (selectedData["regions"]?.length > 0) {
            requestBody.region = { name__in: selectedData["regions"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (Object.keys(selectedData["versions"] || {})?.length>0) {
            requestBody.run = {
                id__in: this.getRunIdsFromVersionsModel(selectedData["versions"])
            };
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.run = {
                scenario: { name__in: selectedData["scenarios"] }
            };
        }

        if (selectedData["models"]?.length > 0) {
            requestBody.run = {
                model: { name__in: selectedData["models"] }
            };
        }

        return requestBody;
    }

    modelBody = (globalSelectedData) => {
        const filtersToApply = this.getFiltersToApply("models", this.selectOrder);
        let selectedData = this.getSelectedDataOfFilter(globalSelectedData, filtersToApply);
        selectedData = this.addDataFocusToSelectedData(selectedData);

        const requestBody: FilterSchema = {};

        if (selectedData["regions"]?.length > 0) {
            requestBody.region = { name__in: selectedData["regions"] };
        }

        if (selectedData["variables"]?.length > 0) {
            requestBody.variable = { name__in: selectedData["variables"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.run = {
                scenario: { name__in: selectedData["scenarios"] }
            };
        }

        return requestBody;
    }

    unitsBody = (globalSelectedData) => {
        return null
    }

    runBody = (globalSelectedData) => {
        const filtersToApply = this.getFiltersToApply("versions", this.selectOrder);
        const selectedData = this.getSelectedDataOfFilter(globalSelectedData, filtersToApply);

        const requestBody: FilterSchema = {};

        if (selectedData["models"]?.length > 0) {
            requestBody.model = { name__in: selectedData["models"] }
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.scenario = { name__in: selectedData["scenarios"] }
        }

        return requestBody;
    }

    scenarioBody = (globalSelectedData) => {
        const filtersToApply = this.getFiltersToApply("scenarios", this.selectOrder);
        let selectedData = this.getSelectedDataOfFilter(globalSelectedData, filtersToApply);
        selectedData = this.addDataFocusToSelectedData(selectedData);

        const requestBody: FilterSchema = {};

        if (selectedData["regions"]?.length > 0) {
            requestBody.region = { name__in: selectedData["regions"] };
        }

        if (selectedData["variables"]?.length > 0) {
            requestBody.variable = { name__in: selectedData["variables"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (selectedData["models"]?.length > 0) {
            requestBody.run = {
                model: { name__in: selectedData["models"] }
            };
        }
        return requestBody;
    }

    static getDatapointsBody = (raw) => {
        const requestBody: FilterSchema = {};

        requestBody.run = { id: raw["run"]?.id != null ? raw["run"]?.id : -1 }
        requestBody.region = { name: raw["region"] };
        requestBody.variable = { name: raw["variable"] };

        if (raw["unit"] != null) {
            requestBody.unit = { name: raw["unit"] };
        }

        return requestBody;
    }

    static getRunBody = (raw) => {
        const requestBody: FilterSchema = {};

        if (raw["model"] != null) {
            requestBody.model = { name: raw["model"] };
        }

        if (raw["scenario"] != null) {
            requestBody.scenario = { name: raw["scenario"] };
        }

        return requestBody;
    }

    /**
    * Get filters that has to be used on this filterId (filters that have a lower idx in selectOrder)
    * Special case when scenario and models are in selectOrder, the last selected is replaced by version and runId
    * in the future to always filter by version/runId after scenarios or models
    * @param filterId the filter which updates its options
    * @param selectOrder the order of selection (filter)
    * @returns a list of filterId to be applied
    */
    getFiltersToApply(filterId, selectOrder) {

        if (selectOrder != undefined) {
            let lowerIdxFilters;

            if (filterId === "versions") {
                // Get all filters with idx <= idx(models) and idx(scenarios)
                const maxIdx = Math.max(selectOrder.indexOf("models"), selectOrder.indexOf("scenarios"))
                lowerIdxFilters = selectOrder.slice(0, maxIdx + 1)
            }
            else {
                const filterIdOrder = selectOrder.indexOf(filterId)
                lowerIdxFilters = filterIdOrder < 0
                    ? [...selectOrder] // filterId not in selectOrder, all selectOrder have lower idx
                    : selectOrder.slice(0, filterIdOrder) // only filters with idx lower than filterIdOrder

                // Replace scenarios or models by run if both in selectOrder, keep the highest idx between them.
                // As it is the same to filter by model/scenario/version or to filter by runId
                // when both scenario and model are selected
                if (
                    !["models", "scenarios"].includes(filterId) &&
                    ["models", "scenarios"].every(item => selectOrder.includes(item))
                ) {
                    const maxIdx = Math.max(selectOrder.indexOf("models"), selectOrder.indexOf("scenarios"))
                    const minIdx = Math.min(selectOrder.indexOf("models"), selectOrder.indexOf("scenarios"))
                    lowerIdxFilters.splice(maxIdx, 1, "versions")
                    lowerIdxFilters.splice(minIdx, 1)
                }
            }
            return lowerIdxFilters
        } else {
            return [];
        }
    }

    /**
     * Get selected data that will be applied for filter
     * exp: SelectOrder = [models, regions, variables ...], the filters to apply for regions is [models]
     * so the return will be {models: [model1, model2,...]}
     * @param selectedData selected data for the entire block
     * @param filtersToApply array of filter that will be applied for the current filter
     * @returns only selected data of the applying filter
     */
    getSelectedDataOfFilter = (selectedData, filtersToApply) => {
        const selectedFilterData = {};
        if (filtersToApply.length > 0) {
            filtersToApply.forEach(key => selectedFilterData[key] = selectedData[key]);
            return selectedFilterData;
        } else {
            return selectedFilterData;
        }
    }

    /**
     * Adding values of data focus to selected data of block.
     * @param selectedData all selected data in the data block.
     * @returns new selected data that contains both seleced values in the data focus and in data block
     */
    addDataFocusToSelectedData = (selectedData) => {
        if (this.dataFocusFilters != null) {
            Object.keys(this.dataFocusFilters).forEach(key => {
                let newSelected: string[] = selectedData[key];
                if (newSelected?.length > 0) {
                    // {Second filter} Find matching values in this.dataFocusFilters[key] and selectedData[key]
                    const values: string[] = this.dataFocusFilters[key].filter(value => newSelected.includes(value));
                    newSelected = values;
                } else {
                    newSelected = [...this.dataFocusFilters[key]];
                }
                selectedData[key] = Array.from(new Set(newSelected));
            });
        }
        return selectedData;
    }

    getRunIdsFromVersionsModel = (versionsDict: versionsModel)=>{
        const runIds: string[] = []
        Object.values(versionsDict).forEach(
            scenario => Object.values(scenario).forEach(
                versions => versions.forEach(
                    version => runIds.push(version.id)
                )
            )
        )
        return runIds
    }

}