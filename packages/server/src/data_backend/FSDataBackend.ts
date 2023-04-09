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

    getFilteredData = (blockMetaData: any, firstFilters: any) => {
        const optionsData = {};
        const dataUnion = this.dataUnion;
        let firstFilterRaws = dataUnion;

        let filterKeys = Object.keys(firstFilters);
        filterKeys = filterKeys.filter(key => key != "categories"); // TODO delete after
        // First filter (by data focus)
        console.log("firstFilters: ", firstFilters)
        filterKeys.forEach(option => {
            if (firstFilters[option].length > 0) {
                firstFilterRaws = firstFilterRaws.filter(raw => firstFilters[option].includes(raw[option.slice(0, -1)]));
            }
        })

        const dataRaws = this.getRaws(blockMetaData, firstFilterRaws);
        console.log("dataRaws:", dataRaws);

        Object.keys(dataRaws).forEach(option => {
            let possible_options: any[] = [];
            if (dataRaws[option].length > 0) {
                possible_options = Array.from(new Set(dataRaws[option].map(raw => raw[option.slice(0, -1)])))
            } else {
                possible_options = Array.from(new Set(firstFilterRaws.map(raw => raw[option.slice(0, -1)])))
            }
            optionsData[option] = possible_options;
        })

        console.log("optionsData:", optionsData);

        return optionsData;
    };

    getData(): any[] {
        return this.data;
    }

    getDataUnion() {
        return this.dataUnion;
    }


    /**
  * Get possible raws based on selected order in config.metaData.selectOrder
  * Exemple: selectOrder = [regions, models]
  * dataRaws[models] will contains all raws of selected regions
  * @param metaData the selected data in block
  * @param firstFilterRaws filtred raws based on data focus
  * @returns possible raws of {model,scenario,region,variable} in each index based on the before selection
  */
    getRaws = (metaData, firstFilterRaws) => {

        const dataRaws = {};
        const filtersLabel = Object.keys(this.filterManager.getFilters());

        // Initialize dataRaws
        filtersLabel.forEach(key => dataRaws[key + "s"] = []); // TODO delete the s

        metaData.selectOrder = metaData.selectOrder.filter(key => key != "categories"); // TODO delete after

        if (metaData.selectOrder.length > 0) {
            const option_unselected = Object.keys(dataRaws).filter(option => !metaData.selectOrder.includes(option));
            const option_selected = metaData.selectOrder;

            // The first selection contains all raws
            const option = metaData.selectOrder[0];
            dataRaws[option] = firstFilterRaws;

            // set possible raws for selected inputs
            for (let i = 1; i < option_selected.length; i++) {
                const current_option = metaData.selectOrder[i];
                const prev_option = metaData.selectOrder[i - 1];
                dataRaws[current_option] = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
            }

            // set possible raws for unselected inputs
            if (option_unselected.length > 0) {
                const prev_option = metaData.selectOrder[metaData.selectOrder.length - 1];// last label selected (drop down)
                const possible_raws = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
                option_unselected.forEach((option) => {
                    dataRaws[option] = possible_raws;
                })
            }
        }
        return dataRaws;
    }

}
