import { FilterObject } from "@future-sight/common";
import TimeSerieObject from "../models/TimeSerieObject";

export default interface IDataBackend {

    getFilters: () => FilterObject;
    getFilterPossibleValues: (filterId: string) => string[] | Promise<string[]>;
    getDataFocus: (selectedData: any) => any | Promise<string[]>;
    getRuns: () => { id; version }
    getTimeSeries: () => TimeSerieObject[] | Promise<TimeSerieObject[]>;
    getFilteredData: (filterId, metaData?: any, dataFocus?: any) => any | Promise<any>;

    // TODO delete after
    getData: () => any[]; // TODO delete it and use instead getTimeSeries
    getDataUnion: () => any[];

}
