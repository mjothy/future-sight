import { FilterObject } from "@future-sight/common";
import TimeSerieObject from "../models/TimeSerieObject";

export default interface IDataBackend {

    getFilters: () => FilterObject;
    getFilterPossibleValues: (filterId: string, selectedData?: any, runId?: number) => string[];
    getDataFocus: (selectedData) => any;
    getRuns: () => { id; version }
    getTimeSeries: () => TimeSerieObject[];
    getFilteredData: (selectedData, keyFilter) => any;

    // TODO delete after
    getData: () => any[]; // TODO delete it and use instead getTimeSeries
    getDataUnion: () => any[];

}
