import FilterDefinitionModel from "./FilterDefinitionModel";

export default class BlockDataModel {

  constructor(filtersDefinition: {[id: string]: FilterDefinitionModel}) {
    this.filters = {};
    this.master = {};
    for (const key of Object.keys(filtersDefinition)) {
      this.filters[key] = [];
      this.master[key] = {
        isMaster: false,
        values: [],
      };
    }
  }
  // Where data is stored
  filters: {[filter_id: string]: string[]};

  // If type of block is control
  master: {[filter_id: string]: {isMaster: boolean, values: string[]}}

  // Selection order
  selectOrder: string[] = [];


}
