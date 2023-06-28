import {versionModel} from "./BlockDataModel";

interface DataPoint{
    year: string;
    value: string;
}

export default interface PlotDataModel {
    data: DataPoint[];
    unit: string;
    model: string | any;
    scenario: string | any;
    variable: string | any;
    region: string | any;
    run: versionModel | any;
    is_default: boolean | any; // is default version of run?
    color?: string | null;
}
