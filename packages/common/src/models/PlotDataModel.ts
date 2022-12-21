interface DataPoint{
  year: string;
  value: string;
}

export default interface PlotDataModel {
  data: DataPoint[];
  unit: string;
  [filter_id_singular: string]: string | any;
}
