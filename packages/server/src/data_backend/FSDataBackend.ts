import * as fs from "fs";
import IDataBackend from "../interfaces/IDataBackend ";
import FilterManager from "../configurations/FilterManager";


export default class FSDataBackend implements IDataBackend {
    private readonly data: any[];
    private readonly dataUnion: any[];
    private readonly filterDataValues: any = {};

    private readonly filterManager: FilterManager;

    constructor(filterManager: FilterManager, dataPath: string, dataUnionPath: string) {

        this.filterManager = filterManager;

        const dataRaw = fs.readFileSync(dataPath);
        const dataUnionRaw = fs.readFileSync(dataUnionPath);

        this.data = JSON.parse(dataRaw.toString());
        this.dataUnion = JSON.parse(dataUnionRaw.toString());

        const keys = Object.keys(filterManager.getFilters())
        keys.forEach(option => {
            this.filterDataValues[option] = Array.from(new Set(this.dataUnion.map(raw => raw[option])))
        })
    }

    getFilters = () => this.filterManager.getFilters();

    getFilterPossibleValues = (filterId: string, selectedData?: any | undefined, runId?: number | undefined) => {
        return this.filterDataValues[filterId];
    };

    getUnits = () => { return [] };

    getRuns = () => {
        return { id: null, version: null };
    }

    getTimeSeries = () => [];

    getFilteredData = (selectedData: any, keyFilter: any) => [];

    getData(): any[] {
        return this.data;
    }

    getDataUnion() {
        return this.dataUnion;
    }

}
