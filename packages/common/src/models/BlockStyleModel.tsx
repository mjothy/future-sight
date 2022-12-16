import FilterDefinitionModel from "./FilterDefinitionModel";

export default class BlockStyleModel {
  constructor(filtersDefinition: {[id: string]: FilterDefinitionModel}) {
    this.legend = {};
    for (const key of Object.keys(filtersDefinition)) {
      this.legend[key] = false
    }
  }

  graphType = 'line';
  showLegend = false;
  YAxis = {
    label: false,
    unit: false,
    force0: false
  };
  legend: {[filter_id: string]: boolean}
  title = {
    value: 'Title',
    isVisible: true,
  };
}
