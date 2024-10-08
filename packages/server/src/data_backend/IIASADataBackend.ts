import { BlockDataModel, DataModel, FilterObject, OptionsDataModel, PlotDataModel } from "@future-sight/common";
import { IAuthenticationBackend } from "../interfaces/IAuthenticationBackend ";
import IDataBackend from "../interfaces/IDataBackend ";
import IIASADataManager from "./IIASADataManager";
import filters from '../configurations/filters.json';
import Filter from "../configurations/Filter";
import TimeSerieObject from "../models/TimeSerieObject"

export default class IIASADataBackend extends IIASADataManager implements IDataBackend {

    constructor(authentication: IAuthenticationBackend) {
        super(authentication);
    }

    getFilters = () => filters;

    getDataFocus = async (dataFocusFilters: OptionsDataModel, filterIDs?: string[]) => { // Normal filter
        const filteredValues = {};
        if (filterIDs == null) {
            const filters: FilterObject = this.getFilters();
            filterIDs = Object.keys(filters);
        }
        const filter = new Filter({}, dataFocusFilters, undefined);
        for (const key of filterIDs) {
            const body = filter.getBody(key);
            const data = await this.patchPromise(filters[key].path, body);
            filteredValues[key] = data?.map(element => element.name);
        }
        return filteredValues;
    };

    getFilteredData = async (filterId, blockMetaData?: BlockDataModel, dataFocusFilters?: any) => {
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const selectOrder = blockMetaData?.selectOrder;
        const showNonDefaultRuns = blockMetaData?.showNonDefaultRuns;

        if (
            filterId === "versions"
            && !["models", "scenarios"].every(item => selectOrder?.includes(item))
        ) {
            const err = "Both models and scenarios should be chosen before asking for versions"
            console.error(err);
            //throw new Error(err);
            return filteredValues;
        }

        // Filter by blockMetaData
        // TODO replace {models, scenarios, regions, scenarios, categories} by one attribute of type OptionsDataModel in MetaData of the block
        const selectedData: OptionsDataModel = {
            regions: [],
            variables: [],
            scenarios: [],
            models: [],
            versions: [],
            metaIndicators: {}
        };

        Object.keys(selectedData).forEach(key => {
            if (blockMetaData != null) {
                selectedData[key] = blockMetaData[key]
            }
        });

        selectedData["metaIndicators"] = blockMetaData?.metaIndicators ?? {};

        const filter = new Filter(selectedData, dataFocusFilters, selectOrder, showNonDefaultRuns);

        if (filterId == "versions") {
            const body = filter.getBody("runs");
            const data = await this.patchPromise("/runs/", body);
            // SEND versions: { "model": {"scenario": default: Run, values: [Runs]}}
            filteredValues["versions"] = this.prepareVersions(data);
        } else {
            const body = filter.getBody(filterId);
            Filter.addMetaRunsToBody(selectedData, body, filterId); // Add runs id from meta indicators if they are selected
            const data = await this.patchPromise(filters[filterId].path, body);
            filteredValues[filterId] = data?.map(element => element.name);
        }

        // Return only data in dataFocus (if exist);
        if (dataFocusFilters[filterId]?.length > 0) {
            filteredValues[filterId] = filteredValues[filterId].filter(value => dataFocusFilters[filterId].includes(value));
        }

        return filteredValues;
    };

    fetchAndFormatDocData = async (filter: any) => {
        const optionsDoc = await this.patchPromise(filter.docPath, undefined, true, "GET")
        const optionsData = await this.patchPromise(filter.path, undefined)
        const formatedDoc = {}
        for (const iDoc of optionsDoc) {
            const optionName = optionsData.find(element => element.id === iDoc["dimension__id"])?.name
            if (optionName){
                formatedDoc[optionName] = iDoc["description"]
            }
        }
        return formatedDoc
    }

    getDocData = async () => {
        const filters = this.getFilters()
        const regions = await this.fetchAndFormatDocData(filters.regions)
        const scenarios = await this.fetchAndFormatDocData(filters.scenarios)
        const models = await this.fetchAndFormatDocData(filters.models)
        const variables = await this.fetchAndFormatDocData(filters.variables)
        return {regions, scenarios, models, variables};
    }

    getTimeSeries = async (selectedData: DataModel[]) => {
        const timeSeries: TimeSerieObject[] = [];
        const runIds = selectedData.map(obj => obj.run?.id);
        const regions = selectedData.map(obj => obj.region);
        const variables = selectedData.map(obj => obj.variable);
        const body = Filter.getDatapointsBody({
            runs: Array.from(new Set(runIds)),
            regions: Array.from(new Set(regions)),
            variables: Array.from(new Set(variables))
        });

        if(body != null){
            const params = new URLSearchParams({
                table: "true",
                join_parameters: "true",
                join_runs: "true"
            });
            const dataPoints = await this.patchPromise("/iamc/datapoints/?"+params, body);

            for (const row of selectedData) {
                const timeSerie = await this.prepareTimeSerie(row, dataPoints);
                timeSeries.push(timeSerie);
            }
        }

        return timeSeries;
    }

    prepareTimeSerie = async (row: any, dataPoints: any) => {
        const timeSerie: TimeSerieObject = {
            ...row,
            data: []
        };

        const modelIndex = dataPoints["columns"].indexOf("model")
        const scenarioIndex = dataPoints["columns"].indexOf("scenario")
        const versionIndex = dataPoints["columns"].indexOf("version")
        const regionIndex = dataPoints["columns"].indexOf("region")
        const variableIndex = dataPoints["columns"].indexOf("variable")

        let data: [any] = dataPoints["data"].filter(element => element[modelIndex] == row.model && element[scenarioIndex]==row.scenario 
            && element[versionIndex]==row.run?.version 
            && element[regionIndex] == row.region 
            && element[variableIndex] == row.variable) // Filter to get values of current row

        if(data?.length > 0){
            const valueIndex = dataPoints["columns"].indexOf("value")
            const yearIndex = dataPoints["columns"].indexOf("step_year")
            const unitIndex = dataPoints["columns"].indexOf("unit")

            // Order dataPoints
            data = data.sort((a, b) => a[yearIndex] - b[yearIndex]);

            data.forEach(point => {
                timeSerie.data.push({ value: point[valueIndex], year: point[yearIndex] });
            })
            if(data.length > 0) {
                timeSerie.unit = data[0][unitIndex]
            }
        }

        return timeSerie;
    }


    prepareVersions = (data) => {
        const versions: VersionSchema = {};
        data.forEach((run: Run) => {
            const model = run?.model?.name;
            const scenario = run?.scenario?.name;
            if (model != null && scenario != null) {

                if (versions[model] == null) {
                    versions[model] = {}
                }
                if (versions[model][scenario] == null) {
                    versions[model][scenario] = {
                        values: []
                    };
                }

                if (run?.is_default) {
                    versions[model][scenario].default = run;
                }

                versions[model][scenario].values.push(run);
            }
        })

        return versions;
    }

    getDataUnion = () => [];

    // NOTE:  showNonDefaultRuns: filter argument not supported
    async getMeta() {
        const filteredValues = {};
        const metaObject = filters.meta;
        const result = {};
        // NOTE: api/meta not working without table parameter
        const response = await this.patchPromise(metaObject.path+"/?table=true", {});

        const runIndex = response["columns"].indexOf("run__id")
        const categoryIndex = response["columns"].indexOf("key")
        const subCategoryIndex = response["columns"].indexOf("value")

        const data = response["data"]

        data.forEach(obj => {
            const category = obj[categoryIndex];
            const subCategory = obj[subCategoryIndex];
            const runId = obj[runIndex];

            result[category] ??= {};
            result[category][subCategory] ??= [];

            result[category][subCategory].push(runId)
        })

        return result;
    }
}
