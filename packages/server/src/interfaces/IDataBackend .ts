import TimeSerieObject from "../models/TimeSerieObject";
import FilterObject from "../models/FilterObject";

export default interface IDataBackend {

    getFilters: () => { [id: string]: FilterObject };
    getFilterPossibleValues: (filterId: string, selectedData?: any, runId?: number) => string[]
    getRuns: () => { id; version }
    getTimeSeries: () => TimeSerieObject[]; //TODO add TimeSerieObject to models
    getFilteredData: (selectedData, keyFilter) => any;

    // TODO delete after
    getData: () => any[];
    getDataUnion: () => any[];

}
