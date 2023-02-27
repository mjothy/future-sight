import PlotDataModel from "../../models/PlotDataModel";
import BlockStyleModel from "../../models/BlockStyleModel";

const DEFAULT_FONT_SIZE = 10;

export default class PlotlyUtils {

    /**
     * Get all years used in this data array. can be non
     * @returns year[]
     */
    static getYears = (dataArray: PlotDataModel[]) => {
        let concatYear:string[] = [];
        for (const dataElement of dataArray) {
            concatYear = [...concatYear, ...dataElement.data.map((element)=>element.year)]
        }
        return [...new Set(concatYear)]
    }

    /**
     * Get index used in this data array. Can be one filterKey or a combination of filterKeys
     * @returns filterKey[]
     */
    static getIndexKeys = (data: PlotDataModel[], filterKeys=["model", "scenario", "variable", "region"]) => {
        if (data.length === 0) {return []}

        const filtersValues = {}
        for (const dataElement of data) {
            for (const key of filterKeys) {
                if (filtersValues[key]) {
                    filtersValues[key].add(dataElement[key])
                } else {
                    filtersValues[key] = new Set([dataElement[key]])
                }
            }
        }

        return filterKeys.filter(
            (key) => filtersValues[key].size > 1
        )
    }

    static getLabel = (str, size, element) => {
        if (str != undefined) {
            const lines = str.split("<br>");
            let width = size / DEFAULT_FONT_SIZE;
            const doc = document.getElementsByClassName(element)[0];
            if (doc !== undefined) {
                const fontSize: any = window.getComputedStyle(doc).getPropertyValue("font-size").split("px")[0];
                const sizeChar = parseFloat(fontSize);
                if (!isNaN(sizeChar)) {
                    width = size / sizeChar;
                }
            }
            let res = '';
            lines.forEach(line => {
                const text = this.stringDivider(line, width, "<br>");
                res = res + text + "<br>";
            });
            return res;
        }
        else return undefined;

    }

    static stringDivider = (str, width, spaceReplacer) => {
        if (str.length > width) {
            let p = width
            for (; p > 0 && str[p] != ' '; p--) {
                if (p > 0) {
                    const left = str.substring(0, p);
                    const right = str.substring(p + 1);
                    return left + spaceReplacer + this.stringDivider(right, width, spaceReplacer);
                }
            }
        }
        return str;
    }

    static filterByCustomXRange = (plotData: PlotDataModel[], configStyle: BlockStyleModel) => {
        const XAxisConfig = configStyle.XAxis
        const data = JSON.parse(JSON.stringify(plotData))

        if(!XAxisConfig.useCustomRange || !XAxisConfig.left || !XAxisConfig.right){
            return data
        }

        for (let i = 0; i < data.length; i++) {
            const dataElement = data[i]
            const dataPoints = [...dataElement.data]
            dataElement.data = dataPoints.filter(
                (dataPoint) =>
                    (XAxisConfig.left||0) <= dataPoint.year &&
                    dataPoint.year<= (XAxisConfig.right||0))
        }
        return data
    }
}
