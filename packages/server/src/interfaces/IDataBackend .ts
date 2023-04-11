import { FilterObject } from "@future-sight/common";
import TimeSerieObject from "../models/TimeSerieObject";

export default interface IDataBackend {

    getFilters: () => FilterObject;
    getFilterPossibleValues: (filterId: string, selectedData?: any, runId?: number) => string[]
    getRuns: () => { id; version }
    getTimeSeries: () => TimeSerieObject[]; //TODO add TimeSerieObject to models
    getFilteredData: (selectedData, keyFilter) => any;

    // TODO delete after
    getData: () => any[];
    getDataUnion: () => any[];

}
