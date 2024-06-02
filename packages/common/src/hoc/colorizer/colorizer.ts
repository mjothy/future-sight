import defaultColorizer from "./defaultColorizer"
import IndexToColorModel from "../../models/IndexToColorModel";
import PlotDataModel from "../../models/PlotDataModel";
import PlotlyUtils from "../../dashboard/graphs/PlotlyUtils";

export default class Colorizer {
    constructor(
        private dataFilterKeys: string[],
        private colors: string[] = defaultColorizer.colors,
        private indexToColor: IndexToColorModel = defaultColorizer.indexToColor,
        private defaultIndex: string | null = defaultColorizer.defaultIndex) { }


    /**
     * Add color to each element of the data array
     * @returns PlotDataModel[]
     */
    colorizeData = (data: PlotDataModel[], colorset: string[], customIndex?: string[]) => {
        if (data.length === 0) {
            return data
        }

        let indexKeys: string[] = customIndex
            ? customIndex
            : PlotlyUtils.getIndexKeys(data, this.dataFilterKeys)

        if (indexKeys.length === 0 && this.defaultIndex) {
            indexKeys = [this.defaultIndex]
        }

        // add color to data
        const dataWithColor = data.map((dataElement) => {
            const dataElementWithColor = { ...dataElement }
            dataElementWithColor.color = this.getColor(dataElement, colorset, indexKeys)
            return dataElementWithColor
        })

        return dataWithColor;
    }


    /**
     * Get color of the graph curve
     * @returns string index
     */
    private getColor = (dataElement: PlotDataModel, colorset: string[], indexKeys: string[]) => {

        if (indexKeys.length == 0) {
            return null
        }

        const indexKeysJoined = indexKeys.join("-")

        const indexValue = indexKeys
            .map((indexKey) => dataElement[indexKey])
            .join("-")

        const colorSetHash = colorset.join()
        if (!this.indexToColor[colorSetHash]
            || !this.indexToColor[colorSetHash][indexKeysJoined]
            || !this.indexToColor[colorSetHash][indexKeysJoined][indexValue]) {
            this.updateIndexToColor(indexKeysJoined, colorset, indexValue)
        }

        return this.indexToColor[colorSetHash][indexKeysJoined][indexValue]
    }

    private updateIndexToColor = (indexKey, colorset, indexValue) => {
        const colorSetHash = colorset.join()
        if (!this.indexToColor[colorSetHash]) {
            this.indexToColor[colorSetHash] = {}
        }
        if (!this.indexToColor[colorSetHash][indexKey]) {
            this.indexToColor[colorSetHash][indexKey] = {}
        }
        if (!this.indexToColor[colorSetHash][indexKey][indexValue]) {
            const colorIdx = Object.keys(this.indexToColor[colorSetHash][indexKey]).length % colorset.length;
            this.indexToColor[colorSetHash][indexKey][indexValue] = colorset[colorIdx]
        }
    }

    resetIndexToColor = () => {
        this.indexToColor = {}
    }
}
