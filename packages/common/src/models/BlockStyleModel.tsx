import FiltersDefinitionModel from "./FiltersDefinitionModel";

export default class BlockStyleModel {
  constructor(filtersDefinition: FiltersDefinitionModel) {
    this.legend = {};
    for (const filter of Object.values(filtersDefinition)) {
      this.legend[filter.id_singular] = false
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
