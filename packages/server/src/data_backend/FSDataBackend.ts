import * as fs from "fs";
import IDataBackend from "../interfaces/IDataBackend ";
import filters from "../configurations/filters.json";

export default class FSDataBackend implements IDataBackend {
    private readonly data: any[];
    private readonly dataUnion: any[];
    private readonly filterDataValues: any = {};

    constructor(dataPath: string, dataUnionPath: string) {

        const dataRaw = fs.readFileSync(dataPath);
        const dataUnionRaw = fs.readFileSync(dataUnionPath);

        this.data = JSON.parse(dataRaw.toString());
        this.dataUnion = JSON.parse(dataUnionRaw.toString());

        const keys = Object.keys(filters)
        keys.forEach(option => {
            this.filterDataValues[option] = Array.from(new Set(this.dataUnion.map(raw => raw[option.slice(0, -1)])))
        })
    }

    getDataFocus = (selectedData) => {
        const optionsData = {
            regions: [],
            variables: [],
            scenarios: [],
            models: [],
            catagories: []
        };

        // Filter data origin from IIASA Api
        const keysIiasa = Object.values(this.getFilters()).filter((filter: any) => filter.origin == "iiasa").map((filter: any) => filter.id);
        keysIiasa.forEach(option1 => {
            let dataUnion = this.getDataUnion();
            keysIiasa.forEach(option2 => {
                if (option1 != option2) {
                    if (selectedData[option2].length > 0) {
                        dataUnion = dataUnion.filter(raw => selectedData[option2].includes(raw[option2.slice(0, -1)]));
                    }
                }
            })
            optionsData[option1] = Array.from(new Set(dataUnion.map(raw => raw[option1.slice(0, -1)])))
        })
        return optionsData;
    };

    getFilters = () => filters;

    getFilterPossibleValues = (filterId: string) => {
        return this.filterDataValues[filterId];
    };

    getUnits = () => { return [] };

    getTimeSeries = () => []; // rename of getData

    getFilteredData = (filterId, blockMetaData: any, dataFocusFilters: any) => {
        const optionsData = {};
        const dataUnion = this.dataUnion;
        let firstFilterRaws = dataUnion;

        let filterKeys = Object.keys(dataFocusFilters);
        filterKeys = filterKeys.filter(key => key != "categories"); // TODO delete after
        // First filter (by data focus)
        filterKeys.forEach(option => {
            if (dataFocusFilters[option].length > 0) {
                firstFilterRaws = firstFilterRaws.filter(raw => dataFocusFilters[option].includes(raw[option.slice(0, -1)]));
            }
        })

        const dataRaws = this.getRaws(blockMetaData, firstFilterRaws);

        Object.keys(dataRaws).forEach(option => {
            let possible_options: any[] = [];
            if (dataRaws[option].length > 0) {
                possible_options = Array.from(new Set(dataRaws[option].map(raw => raw[option.slice(0, -1)])))
            } else {
                possible_options = Array.from(new Set(firstFilterRaws.map(raw => raw[option.slice(0, -1)])))
            }
            optionsData[option] = possible_options;
        })


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

        // @User selects Model & scenario
        // + request /iamc/runs with model & scenario
        // => retreive all runid & associated versions
        // @User selects one or more version
        // +request /iamc/variables with runid=
        // => retreive all corresponding variables
        // @User select one or more variable
        // +request /iamc/regions with runid & variable
        // => retreive all regions

        const dataRaws = {};
        const filtersLabel = Object.keys(filters);

        // Initialize dataRaws
        filtersLabel.forEach(key => dataRaws[key] = []); // TODO delete the s

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
