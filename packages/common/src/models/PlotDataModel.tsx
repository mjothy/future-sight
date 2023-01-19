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
}
