export default class BlockStyleModel {
  graphType = 'line';
  showLegend = false;
  YAxis = {
    label: false,
    unit: false,
    force0: false
  };
  legend = {
    Model: false,
    Scenario: false,
    Region: false,
    Variable: false
  };
  title = {
    value: 'Title',
    isVisible: true,
  };
  stack = {
    isStack: false,
    isGroupBy: false,
    value: ''
  }
}
