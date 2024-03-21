import PlotDataModel from "../../models/PlotDataModel";
import BlockStyleModel from "../../models/BlockStyleModel";
import { table } from "console";

const DEFAULT_FONT_SIZE = 10;

export default class PlotlyUtils {

    /**
     * Get all years used in this data array. can be non
     * @returns year[]
     */
    static getYears = (dataArray: PlotDataModel[]) => {
        let concatYear: string[] = [];
        for (const dataElement of dataArray) {
            concatYear = [...concatYear, ...dataElement.data.map((element) => element.year)]
        }
        return [...new Set(concatYear)]
    }

    /**
     * Get index used in this data array. Can be one filterKey or a combination of filterKeys
     * @returns filterKey[]
     */
    static getIndexKeys = (data: PlotDataModel[], filterKeys = ["model", "scenario", "variable", "region"]) => {
        if (data.length === 0) { return [] }

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

        if (XAxisConfig.useCustomRange) {
            const left = XAxisConfig.left ?? 0;
            const right = XAxisConfig.right ?? 0;
            if(left > 1900 && right >= left){
                for (let i = 0; i < data.length; i++) {
                    const dataElement = data[i]
                    const dataPoints = [...dataElement.data]
                    dataElement.data = dataPoints.filter(
                        (dataPoint) =>
                            left <= dataPoint.year &&
                            dataPoint.year <= right)
                }
            }

            if (XAxisConfig.timestep != null) {
                this.addTimestep(data, XAxisConfig.timestep, left > 1900 ? left : null, (left > 1900 && right >= left) ? right : null);
            }

        }
        return data
    }

    static addTimestep(data, step, yearLeft, yearRight) {

        data.forEach(timeSerie => {
            const years = timeSerie.data.map(e => e.year)
            const years_step: number[] = [];
            if (years.length > 0) {
                const min = yearLeft ?? years[0];
                const max = yearRight ?? years[years.length - 1]
                for (let i = min; i <= max; i = i + step) {
                    years_step.push(i);
                }
            }

            if (years_step.length > 0) {
                timeSerie.data = timeSerie.data.filter(e => years_step.includes(e.year));
            }
        })
    }

    /**
     * Show only data points between max and min selected values (min and max are configurable)
     * for plotly plots, this part is implemented using range attribute in plot layout config
     * This methode is useful only for type=table
     * @param plotData data with time series {model, scenario, ... , data:{year, value}}
     * @param configStyle plot configuration
     */
    static filterByCustomYRange = (plotData: PlotDataModel[], configStyle: BlockStyleModel) => {
        const YAxisConfig = configStyle.YAxis
        const data = JSON.parse(JSON.stringify(plotData))

        if (YAxisConfig.useCustomRange) {
            const min = YAxisConfig.min;
            const max = YAxisConfig.max;
            if(min || max){
                for (let i = 0; i < data.length; i++) {
                    const dataElement = data[i]
                    const dataPoints = [...dataElement.data]
                    dataElement.data = dataPoints.filter(
                        (dataPoint) =>
                            (min || dataPoint.value) <= dataPoint.value &&
                            dataPoint.value <= (max || dataPoint.value))
                }
            }
        }
        return data
    }

    static ySumByYear = (data) => {
        return data.reduce((groups, obj) => {
            const { x, y } = obj;
            const existingGroup = groups.find((group) => group.x === x);

            if (existingGroup) {
                existingGroup.y = Number(existingGroup.y) + Number(y);
            } else {
                groups.push({ x, y: Number(y) });
            }

            return groups;
        }, []);
    };

    static getAggregation(arr, type): number {
        let result = 0;
        switch (type) {
            case "sum":
                arr.forEach((element) => {
                    result += element;
                });
                return result;

            case "avg":
                arr.forEach((element) => {
                    result += element;
                });
                return result / arr.length;

            case "median":
                const mid = Math.floor(arr.length / 2),
                    nums = [...arr].sort((a, b) => a - b);
                return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

            default: return result;
        }
    }
}
