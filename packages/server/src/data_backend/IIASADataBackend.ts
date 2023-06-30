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
        const filterKeys = filterIDs.filter(key => key != "categories"); // TODO delete filter
        const filter = new Filter({}, dataFocusFilters, undefined);
        for (const key of filterKeys) {
            const body = filter.getBody(key);
            const data = await this.patchPromise(filters[key].path, body);
            filteredValues[key] = data.map(element => element.name);
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
            versions: []
        };

        Object.keys(selectedData).forEach(key => {
            if (blockMetaData != null) {
                selectedData[key] = blockMetaData[key]
            }
        });

        const filter = new Filter(selectedData, dataFocusFilters, selectOrder, showNonDefaultRuns);

        if (filterId == "versions") {
            const body = filter.getBody("runs");
            const data = await this.patchPromise("/runs/", body);
            // SEND versions: { "model": {"scenario": default: Run, values: [Runs]}}
            filteredValues["versions"] = this.prepareVersions(data);
        } else {
            const body = filter.getBody(filterId);
            const data = await this.patchPromise(filters[filterId].path, body);
            filteredValues[filterId] = data.map(element => element.name);
        }

        // Return only data in dataFocus (if exist);
        if (dataFocusFilters[filterId]?.length > 0) {
            filteredValues[filterId] = filteredValues[filterId].filter(value => dataFocusFilters[filterId].includes(value));
        }

        return filteredValues;
    };

    getTimeSeries = async (selectedData: DataModel[]) => {
        const timeSeries: TimeSerieObject[] = [];
        for (const raw of selectedData) {
            const rawWithRun = await this.getRawWithRun(raw);
            const body = Filter.getDatapointsBody(rawWithRun);
            const dataPoints = await this.patchPromise("/iamc/datapoints/", body);
            if (dataPoints?.length > 0) {
                const timeSerie = await this.prepareTimeSerie(rawWithRun, dataPoints);
                timeSeries.push(timeSerie);
            }
        }
        return timeSeries;

    }

    // TODO getting runs could probably be optimized if we use multiple timeseries with same scenario model
    // Here call /runs for each timeserie instead of each combination of scenario model
    getRawWithRun = async (raw: DataModel) => {
        const body = Filter.getRunBody(raw);
        const data = await this.patchPromise("/runs/", body);
        const runDefault = data.find(run => run.is_default);
        const outputRaw: PlotDataModel = JSON.parse(JSON.stringify(raw))

        if (Object.keys(raw).includes("run")) {
            // Check if run is default when provided
            outputRaw.is_default = outputRaw.run.id == runDefault?.id
        } else {
            outputRaw.run = runDefault;
            outputRaw.is_default = true;
        }
        return outputRaw;
    }

    prepareTimeSerie = async (raw: any, dataPoints: any) => {
        const timeSerie: TimeSerieObject = {
            ...raw,
            data: []
        };
        const tsMeta = await this.patchPromise("/iamc/timeseries/" + dataPoints[0].time_series__id, undefined, true, "GET");
        timeSerie.unit = tsMeta.parameters.unit
        // Order dataPoints
        dataPoints.sort((a, b) => a.step_year - b.step_year);

        dataPoints.forEach(point => {
            timeSerie.data.push({ value: point.value, year: point.step_year });
        })

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
}
