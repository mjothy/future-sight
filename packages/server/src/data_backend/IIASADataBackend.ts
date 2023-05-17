import { BlockDataModel, FilterObject, OptionsDataModel } from "@future-sight/common";
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

    getDataFocus = async (selectedData: OptionsDataModel) => { // Normal filter
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const filterKeys = Object.keys(filters);
        const filter = new Filter(selectedData);
        for (const key of filterKeys) {
            try {
                const body = filter.getBody(key);
                const response = await this.patchPromise(filters[key].path, body);
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
    getFilteredData = async (filterId, blockMetaData?: BlockDataModel, dataFocusFilters?: any) => {
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const filterKeys = Object.keys(filters);
        const selectOrder = blockMetaData?.selectOrder;

        if (
            filterId === "versions"
            && !["models", "scenarios"].every(item => selectOrder?.includes(item))
        ) {
            const err = "Both models and scenarios should be chosen before asking for versions"
            console.error(err);
            throw new Error(err);
        }

        // Filter by blockMetaData
        // TODO replace {models, scenarios, regions, scenarios, categories} by one attribute of type OptionsDataModel
        const selectedData: OptionsDataModel = {
            regions: [],
            variables: [],
            scenarios: [],
            models: []
        };

        // TODO Fetch values of only filterId (after code merging with develop branch)
        const filter = new Filter(selectedData, dataFocusFilters, selectOrder);
        for (const key of filterKeys) {
            try {
                const body = filter.getBody(key);
                const response = await this.patchPromise(filters[key].path, body);
                let data = await response.json();
                if (key == "versions") {
                    // TODO extract all versions from 
                    filteredValues[key] = [];
                } else {
                    if (!Array.isArray(data)) {
                        data = Array.from(data);
                    }
                    filteredValues[key] = data.map(element => element.name);
                }

            } catch (e: Error | any) {
                // Scenarios not working 500 internal error
                console.error(`Error fetching (filtering data) ${key}: ${e.toString()}`)
                filteredValues[key] = [];
            }
        }

        // Return only data in dataFocus (if exist);
        filterKeys.forEach(key => {
            if (dataFocusFilters[key]?.length > 0) {
                filteredValues[key] = filteredValues[key].filter(value => dataFocusFilters[key].includes(value));
            }
        });

        return filteredValues;
    };

    getTimeSeries = (selectedData: OptionsDataModel) => {
        // TODO move getData() code here
        return [];
    };

    getData = (selectedData?: any) => {
        for (const raw of selectedData) {
            const body = Filter.getDatapointsBody(raw);
            console.log("body: ", body);
        }

        // try {
        //     const body = filter.getBody(key);
        //     const response = await this.patchPromise(filters[key].path, body);
        //     let data = await response.json();
        //     if (key == "versions") {
        //         // TODO extract all versions from 
        //         filteredValues[key] = [];
        //     } else {
        //         if (!Array.isArray(data)) {
        //             data = Array.from(data);
        //         }
        //         filteredValues[key] = data.map(element => element.name);
        //     }

        // } catch (e: Error | any) {
        //     // Scenarios not working 500 internal error
        //     console.error(`Error fetching (filtering data) ${key}: ${e.toString()}`)
        //     filteredValues[key] = [];
        // }

        return [];
    };

    getDataUnion = () => [];
}