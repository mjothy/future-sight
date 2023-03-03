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
    version: string | any;
    is_default: string | any; // is default version of run?
    color?: string | null;
}
