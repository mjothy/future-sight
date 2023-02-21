import defaultColorizer from "./defaultColorizer"
import IndexToColorModel from "../../models/IndexToColorModel";
import PlotDataModel from "../../models/PlotDataModel";
import PlotlyUtils from "../../dashboard/graphs/PlotlyUtils";

export default class Colorizer {
    constructor(
        private dataFilterKeys: string[],
        private colors: string[] = defaultColorizer.colors,
        private indexToColor: IndexToColorModel = defaultColorizer.indexToColor,
        private defaultIndex: string | null = defaultColorizer.defaultIndex)
    {}


    /**
     * Add color to each element of the data array
     * @returns PlotDataModel[]
     */
    colorizeData = (data: PlotDataModel[], customIndex?: string) => {
        if (data.length === 0) {
            return data
        }

        let indexKeys: string[] = customIndex
            ? [customIndex]
            : PlotlyUtils.getIndexKeys(data, this.dataFilterKeys)

        if (indexKeys.length === 0 && this.defaultIndex) {
            indexKeys = [this.defaultIndex]
        }

        // add color to data
        return data.map((dataElement) => {
            const dataElementWithColor = {...dataElement}
            dataElementWithColor.color = this.getColor(dataElement, indexKeys)
            return dataElementWithColor
        })
    }


    /**
     * Get color of the graph curve
     * @returns string index
     */
    private getColor = (dataElement: PlotDataModel, indexKeys: string[]) => {

        if(indexKeys.length==0) {
            // console.log("no index")
            return null
        }

        const indexKeysJoined = indexKeys.join("-")

        const indexValue = indexKeys
            .map((indexKey) => dataElement[indexKey])
            .join("-")

        if (!this.indexToColor[indexKeysJoined] || !this.indexToColor[indexKeysJoined][indexValue]){
            this.updateIndexToColor(indexKeysJoined, indexValue)
        }

        return this.indexToColor[indexKeysJoined][indexValue]
    }

    private updateIndexToColor = (indexKey, indexValue)=>{
        if (!this.indexToColor[indexKey]){
            this.indexToColor[indexKey]={}
        }

        if (!this.indexToColor[indexKey][indexValue]){
            const colorIdx = Object.keys(this.indexToColor[indexKey]).length % this.colors.length
            this.indexToColor[indexKey][indexValue] = this.colors[colorIdx]
        }
    }

    resetIndexToColor = () => {
        this.indexToColor = {}
    }
}
