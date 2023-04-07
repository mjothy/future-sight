import TimeSerieObject from "../models/TimeSerieObject";

export default interface IDataBackend {

    getModels: () => any;
    getVariables: (runId?: number) => any;
    getScenarios: () => any;
    getRegions: () => any;
    getUnits: () => any;
    getCategories: () => any;
    getRuns: () => { id; version }
    getTimeSeries: () => TimeSerieObject[]; //TODO add TimeSerieObject to models
    getFilteredData: (selectedData, keyFilter) => any;

    // TODO delete after
    getData: () => any[];
    getDataUnion: () => any[];
    getGeojson: (regions: string[]) => any;

}
