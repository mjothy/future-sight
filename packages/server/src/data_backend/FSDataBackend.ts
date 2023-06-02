import * as fs from "fs";
import IDataBackend from "../interfaces/IDataBackend ";
import filters from "../configurations/filters.json";

export default class FSDataBackend implements IDataBackend {
    private readonly data: any[];
    private readonly dataUnion: any[];
    private readonly filterDataValues: any = {};

    constructor(dataPath: string, dataUnionPath: string) {

        const dataRaw = fs.readFileSync(dataPath);
        const dataUnionRaw = fs.readFileSync(dataUnionPath);

        this.data = JSON.parse(dataRaw.toString());
        this.dataUnion = JSON.parse(dataUnionRaw.toString());

        const keys = Object.keys(filters)
        keys.forEach(option => {
            this.filterDataValues[option] = Array.from(new Set(this.dataUnion.map(raw => raw[option.slice(0, -1)])))
        })
    }

    getDataFocus = (selectedData) => {
        const optionsData = {
            regions: [],
            variables: [],
            scenarios: [],
            models: [],
            catagories: []
        };

        // Filter data origin from IIASA Api
        const keysIiasa = Object.values(this.getFilters()).filter((filter: any) => filter.origin == "iiasa").map((filter: any) => filter.id);
        keysIiasa.forEach(option1 => {
            let dataUnion = this.getDataUnion();
            keysIiasa.forEach(option2 => {
                if (option1 != option2) {
                    if (selectedData[option2].length > 0) {
                        dataUnion = dataUnion.filter(raw => selectedData[option2].includes(raw[option2.slice(0, -1)]));
                    }
                }
            })
            optionsData[option1] = Array.from(new Set(dataUnion.map(raw => raw[option1.slice(0, -1)])))
        })
        return optionsData;
    };

    getFilters = () => filters;

    getFilterPossibleValues = (filterId: string) => {
        return this.filterDataValues[filterId];
    };

    getUnits = () => { return [] };

    getTimeSeries = () => []; // rename of getData

    getFilteredData = (filterId, blockMetaData: any, dataFocusFilters: any) => {
        const optionsData = {};
        const dataUnion = this.dataUnion;

        if (
            filterId === "versions"
            && !["models", "scenarios"].every(item => blockMetaData.selectOrder.includes(item))
        ) {
            const err = "Both models and scenarios should be chosen before asking for versions"
            console.error(err);
            return optionsData; // TODO error handle
        }

        // First filter (by data focus) -- only one filter selected
        let dataFocusFiltersRaws = dataUnion;
        Object.keys(dataFocusFilters).forEach(option => {
            if (option === "categories") { // TODO delete after
                return
            }

            if (dataFocusFilters[option].length > 0) {
                dataFocusFiltersRaws = dataFocusFiltersRaws.filter(raw => dataFocusFilters[option].includes(raw[option.slice(0, -1)]));
            }
        })

        // Filter by selection
        const dataRaws = this.getRawsByFilterId(filterId, blockMetaData, dataFocusFiltersRaws);

        if (filterId === "versions") {
            optionsData["versions"] = this.getVersionDictFromRaws(dataRaws);
        } else {
            optionsData[filterId] = Array.from(new Set(dataRaws.map(raw => raw[filterId.slice(0, -1)])))
        }

        return optionsData;
    };

    getData(selectedDataRaws?: any): any[] {

        let elements = [...this.data];
        const response: any[] = [];
        for (const reqData of selectedDataRaws) { // TODO delete for
            // TODO VERSION
            if (reqData.version) {
                elements = elements.filter(
                    (e) => e.model === reqData.model && e.scenario === reqData.scenario && e.variable === reqData.variable && e.region === reqData.region && e.version === reqData.version
                );
            } else {
                elements = elements.filter(
                    (e) => e.model === reqData.model && e.scenario === reqData.scenario && e.variable === reqData.variable && e.region === reqData.region && e.is_default === "True"
                );
            }
            if (elements) {
                response.push(...elements);
            }
        }
        return response;
    }

    getDataUnion() {
        return this.dataUnion;
    }


    // @User selects Model & scenario
    // + request /iamc/runs with model & scenario
    // => retreive all runid & associated versions
    // @User selects one or more version
    // +request /iamc/variables with runid=
    // => retreive all corresponding variables
    // @User select one or more variable
    // +request /iamc/regions with runid & variable
    // => retreive all regions

    /**
   * Get possible raws based on selected order in config.metaData.selectOrder
   * Exemple: selectOrder = [regions, models]
   * dataRaws[models] will contain all raws of selected regions
   * @param filterId the filter which updates its options
   * @param metaData the selected data in block
   * @param dataFocusFiltersRaws filtred raws based on data focus
   * @returns possible raws of {model,scenario,region,variable} in each index based on the before selection
   */
    getRawsByFilterId = (filterId, metaData, dataFocusFiltersRaws) => {
        // Get filterToApply
        const filtersToApply = this.getFiltersToApply(filterId, metaData)

        // The first selection contains all raws
        let dataRaws = dataFocusFiltersRaws;

        // Filter by filters with lower idx
        for (const tempFilter of filtersToApply) {
            dataRaws = (tempFilter === "versions")
                ? this.filterRawByVersions(dataRaws, metaData)
                : dataRaws.filter(raw => metaData[tempFilter].includes(raw[tempFilter.slice(0, -1)]));
        }

        return dataRaws;
    }

    /**
     * Get filters that has to be used on this filterId (filters that have a lower idx in selectOrder)
     * Special case when scenario and models are in selectOrder, the last selected is replaced by versions and runId
     * in the future to always filter by versions/runId after scenarios or models
     * @param filterId the filter which updates its options
     * @param metaData the selected data in block
     * @returns a list of filterId to be applied
     */
    getFiltersToApply(filterId, metaData) {

        let lowerIdxFilters;

        if (filterId === "versions") {
            // Get all filters with idx <= idx(models) and idx(scenarios)
            const maxIdx = Math.max(metaData.selectOrder.indexOf("models"), metaData.selectOrder.indexOf("scenarios"))
            lowerIdxFilters = metaData.selectOrder.slice(0, maxIdx + 1) // TODO replace by runId here
        }
        else {
            const filterIdOrder = metaData.selectOrder.indexOf(filterId)
            lowerIdxFilters = filterIdOrder < 0
                ? [...metaData.selectOrder] // filterId not in selectOrder, all selectOrder have lower idx
                : metaData.selectOrder.slice(0, filterIdOrder) // only filters with idx lower than filterIdOrder

            // Replace scenarios or models by versions if both in selectOrder, choose the highest idx between them.
            // As it is the same to filter by model/scenario/version or to filter by runId
            // when both scenario and model are selected
            if (["models", "scenarios"].every(item => metaData.selectOrder.includes(item))) {
                const maxIdx = Math.max(metaData.selectOrder.indexOf("models"), metaData.selectOrder.indexOf("scenarios"))
                lowerIdxFilters.splice(maxIdx + 1, 0, "versions") // TODO replace by runId here
            }
        }
        return lowerIdxFilters
    }

    /**
     * Filter by versions. Versions are stored differently hence a different function than other filters
     * @param dataRaws rows of data to filter
     * @param metaData the selected data in block
     * @returns a dataRaws filtered by versions/runId in the future
     */
    filterRawByVersions(dataRaws, metaData) {
        const selectedVersions = metaData.versions
        return dataRaws.filter(raw => {
            if (!!selectedVersions[raw.model]
                && !!selectedVersions[raw.model][raw.scenario]
                && selectedVersions[raw.model][raw.scenario].length > 0
            ) {
                return selectedVersions[raw.model][raw.scenario].includes(raw.version)
            } else {
                // No selection so select default
                return raw.is_default
            }
        });
    }

    /**
     * Transform dataRaws into a versionDict format
     * @param dataRaws rows of data
     * @returns a dict in format dict[model][scenario]: versionId[]
     */
    getVersionDictFromRaws(dataRaws) {
        const version_dict = {};
        for (const raw of dataRaws) {
            !(raw["model"] in version_dict) && (version_dict[raw.model] = {});
            !(raw["scenario"] in version_dict[raw["model"]]) && (version_dict[raw["model"]][raw["scenario"]] = { default: "", values: [] });
            (raw["is_default"] == "True") && (version_dict[raw["model"]][raw["scenario"]].default = raw["version"]);
            !(version_dict[raw.model][raw.scenario].values.includes(raw.version)) && (version_dict[raw.model][raw.scenario].values.push(raw.version));
        }
        return version_dict
    }

}
