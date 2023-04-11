import FilterManager from "../configurations/FilterManager";
import { ACCESS_TOKEN, SPECIAL_KEY, URL_ECEMF } from "../env";
import IDataBackend from "../interfaces/IDataBackend ";
import IIASADataManager from "./IIASADataManager";


export default class IIASADataBackend extends IIASADataManager implements IDataBackend {

    private readonly filterManager: FilterManager;

    constructor(filterManager: FilterManager) {
        super(URL_ECEMF, SPECIAL_KEY, ACCESS_TOKEN);
        this.filterManager = filterManager;
    }

    getFilters = () => this.filterManager.getFilters();

    getFilterPossibleValues = (filterId: string, selectedData?: any | undefined, runId?: number | undefined) => {
        return [];
    };

    getDataFocus = (selectedData: any) => [];

    getModels = () => {
        return this.getPromise('/models')
    }
    
    getVariables = () => {
        return this.getPromise('/variables')

    };

    getScenarios = () => {
        return this.getPromise('/scenarios')

    };
    getRegions = () => {
        return this.getPromise('/regions')

    };

    getFilteredData = (selectedData: any, option: any) => {
        // ??????
        return this.patchPromise('') // TODO add a class that return body for each option

    };

    getUnits = () => {
        return this.getPromise('/units')

    };

    getCategories = () => {
        return this.getPromise('/categories')

    };

    getRuns = () => {
        return { id: null, version: null };
    }

    getTimeSeries = () => [];

    getData = () => [];

    getDataUnion = () => [];
}