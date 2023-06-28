import {DataModel, FilterObject, OptionsDataModel} from "@future-sight/common";
import TimeSerieObject from "../models/TimeSerieObject";

export default interface IDataBackend {

    /**
     * Exemple: {"filter": {id, label, path, ...}}
     * @returns the configuration filter file
     */
    getFilters: () => FilterObject;
    /**
     * Filter Data Focus
     * @param selectedData The data selected in data focus
     * @param filterIDs Selected filtered
     * @returns filtered data (values)
     */
    getDataFocus: (selectedData: any, filterIDs?: string[]) => any | Promise<string[]>;
    /**
     * Get data with timeseries to plot on graph
     * @param selectedData Selected values in data block
     * @returns 
     */
    getTimeSeries: (selectedData: DataModel[]) => any[] | Promise<any[]>; // TODO replace any by OptionsDataModel
    /**
     * Get filterd values in data block
     * @param filterId the filter id
     * @param metaData selected data in block
     * @param dataFocus data selected in data focus
     * @returns 
     */
    getFilteredData: (filterId, metaData?: any, dataFocus?: any) => any | Promise<any>;

}
