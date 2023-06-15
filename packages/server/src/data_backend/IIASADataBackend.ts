import { BlockDataModel, FilterObject, OptionsDataModel } from "@future-sight/common";
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

    getDataFocus = async (dataFocusFilters: OptionsDataModel) => { // Normal filter
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const filterKeys = Object.keys(filters).filter(key => key != "categories"); // TODO delete filter
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

        // TODO Handle error
        if (
            filterId === "versions"
            && !["models", "scenarios"].every(item => selectOrder?.includes(item))
        ) {
            const err = "Both models and scenarios should be chosen before asking for versions"
            console.error(err);
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

        const filter = new Filter(selectedData, dataFocusFilters, selectOrder);

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

    getTimeSeries = async (selectedData?: any) => {
        const timeSeries: TimeSerieObject[] = [];
        for (const raw of selectedData) {
            const rawWithRun = await this.getRawWithRun(raw);
            const body = Filter.getDatapointsBody(rawWithRun);
            const dataPoints = await this.patchPromise("/iamc/datapoints/", body);
            if (dataPoints?.length > 0) {
                const timeSerie = this.prepareTimeSerie(rawWithRun, dataPoints);
                timeSeries.push(timeSerie);
            }
        }
        return timeSeries;
    }

    getRawWithRun = async (raw) => {
        const body = Filter.getRunBody(raw);
        const data = await this.patchPromise("/runs/", body);
        const runDefault = data.find(run => run.is_default);
        raw["run"] = runDefault;
        raw.is_default = true;
        raw.version = runDefault?.version;
        return raw;
    }

    prepareTimeSerie = (raw: any, dataPoints: any) => {
        const timeSerie: TimeSerieObject = {
            ...raw,
            data: []
        };

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
