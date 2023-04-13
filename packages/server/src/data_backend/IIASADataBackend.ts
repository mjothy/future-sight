import { FilterObject } from "@future-sight/common";
import FilterManager from "../configurations/FilterManager";
import { IAuthenticationBackend } from "../interfaces/IAuthenticationBackend ";
import IDataBackend from "../interfaces/IDataBackend ";
import IIASADataManager from "./IIASADataManager";

const URL_ECEMF = "https://dev.ixmp.ece.iiasa.ac.at/v1/ecemf";
// const SPECIAL_KEY = "/iamc"
export default class IIASADataBackend extends IIASADataManager implements IDataBackend {

    private readonly filterManager: FilterManager;
    private readonly auth: IAuthenticationBackend;

    constructor(filterManager: FilterManager, authentication: IAuthenticationBackend) {
        super(URL_ECEMF);
        this.filterManager = filterManager;
        this.auth = authentication;
    }

    getFilters = () => this.filterManager.getFilters();

    getFilterPossibleValues = async (filterId: string) => {
        const filters: FilterObject = this.getFilters();
        const response = await this.getPromise(filters[filterId].path, this.auth.getToken());
        let data = await response.json()
        try {
            if (!Array.isArray(data)) {
                data = Array.from(data);
            }
            return data.map(element => element.name);
        } catch (e: Error | any) {
            throw Error(`Error fetching ${filters[filterId].label}: ${e.toString()}`)
        }
    };

    getDataFocus = (selectedData: any) => { // Normal filter
        const filteredValues = {};
        const filters: FilterObject = this.getFilters();
        const filterKeys = Object.keys(filters);
        for (const key of filterKeys) {
            filteredValues[key] = []; // TODO get filtered data from API using this.patchPromise(path, options)
        }
        return filteredValues;
    };

    getFilteredData = (selectedData: any, option: any) => { // Use order of selection
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