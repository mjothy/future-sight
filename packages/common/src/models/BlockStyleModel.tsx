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
  colorbar = {
    isShow: true,
    colorscale: ["#fafa6e", "#9cdf7c", "#4abd8c", "#00968e", "#106e7c", "#2a4858"],
    reverse: false,
    title: {
      variable: false,
      unit: true
    }
  }
}
