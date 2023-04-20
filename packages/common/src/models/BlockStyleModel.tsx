export default class BlockStyleModel {
  graphType = 'line';
  showLegend = false;
  showDeprecatedVersionWarning = true;
  YAxis = {
    label: false,
    unit: false,
    force0: false
  };
  legend = {
    Model: false,
    Scenario: false,
    Region: false,
    Variable: false,
    Version: false
  };
  title = {
    value: 'Title',
    isVisible: true,
  };
  subtitle = {
    models: {
      isCustom: false,
      value: ""
    },
    scenarios:{
      isCustom: false,
      value: ""
    },
    regions:{
      isCustom: false,
      value: ""
    },
    variables:{
      isCustom: false,
      value: ""
    }
  };
  XAxis = {
    useCustomRange: false,
    left: null,
    right: null,
    default: null,
    useSlider: false,
  };
  stack = {
    isStack: false,
    isGroupBy: false,
    value: ''
  };
  pie = {
    isDonut: false,
    showPercent: true,
    showSubtitle: true
  }
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
