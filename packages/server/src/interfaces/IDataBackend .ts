import { FilterObject, OptionsDataModel } from "@future-sight/common";
import TimeSerieObject from "../models/TimeSerieObject";

export default interface IDataBackend {

    getFilters: () => FilterObject;
    /**
     * Called only for initiate Data Focus
     * @param filterId id of the filter 
     * @returns liste of all values
     */
    getFilterPossibleValues: (filterId: string) => string[] | Promise<string[]>;
    getDataFocus: (selectedData: any) => any | Promise<string[]>;
    getTimeSeries: (selectedData: OptionsDataModel) => TimeSerieObject[] | Promise<TimeSerieObject[]>; // TODO replace any by OptionsDataModel
    getFilteredData: (filterId, metaData?: any, dataFocus?: any) => any | Promise<any>;

    // TODO delete after
    getData: (selectedData?: any) => any[] | Promise<any[]>; // TODO delete it and use instead getTimeSeries
    getDataUnion: () => any[];

}
