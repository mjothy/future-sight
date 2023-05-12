import { BlockDataModel, FilterObject } from "@future-sight/common";
import { IAuthenticationBackend } from "../interfaces/IAuthenticationBackend ";
import IDataBackend from "../interfaces/IDataBackend ";
import IIASADataManager from "./IIASADataManager";
import filters from '../configurations/filters.json';
import Filter from "../configurations/Filter";

export default class IIASADataBackend extends IIASADataManager implements IDataBackend {

    constructor(authentication: IAuthenticationBackend) {
        super(authentication);
    }

    getFilters = () => filters;

    getFilterPossibleValues = async (filterId: string) => {
        const filters: FilterObject = this.getFilters();
        try {
            const response = await this.patchPromise(filters[filterId].path);
            let data = await response.json()

            if (!Array.isArray(data)) {
                data = Array.from(data);
            }
            return data.map(element => element.name);
        } catch (e: Error | any) {
            // scenarios not working 500 internal error
            console.error(`Error fetching ${filters[filterId].label}: ${e.toString()}`)
            return [];
        }
    };

    getDataFocus = async (selectedData: any) => { // Normal filter
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const filterKeys = Object.keys(filters);
        const filter = new Filter(selectedData);
        for (const key of filterKeys) {
            try {
                const body = filter.getBody(key);
                const response = await this.patchPromise(filters[key].path, body); // TODO get filtered data from API using this.patchPromise(path, options)
                let data = await response.json();
                if (!Array.isArray(data)) {
                    data = Array.from(data);
                }
                filteredValues[key] = data.map(element => element.name);
            } catch (e: Error | any) {
                // Scenarios not working 500 internal error
                console.error(`Error fetching (data focus) ${key}: ${e.toString()}`)
                filteredValues[key] = [];
            }
        }
        return filteredValues;
    };

    // TODO même que getFilterPossibleValues (with empty body)
    getFilteredData = (filterId, blockMetaData: BlockDataModel, dataFocusFilters: any) => {
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const filterKeys = Object.keys(filters);
        for (const key of filterKeys) {
            filteredValues[key] = []; // TODO get filtered data from API using this.patchPromise(path, options)
        }
        return filteredValues;
    };

    getRuns = () => {
        return { id: null, version: null };
    }

    getTimeSeries = () => [];

    getData = () => [];

    getDataUnion = () => [];
}