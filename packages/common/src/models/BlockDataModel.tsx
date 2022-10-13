export default class BlockDataModel {
  /**
   * The key is the model name, and data is table lf scenarios
   */
  models: string[] = [];
  scenarios: string[] = [];
  regions: string[] = [];
  variables: string[] = [];

  /**
   * Selection order
   */
  selectOrder: string[] = [];

  /**
   * If type of block is control
   */
  master = {
    models: {
      isMaster: false,
      values: [],
    },
    scenarios: {
      isMaster: false,
      values: [],
    },
    regions: {
      isMaster: false,
      values: [],
    },
    variables: {
      isMaster: false,
      values: [],
    },
  };

}
