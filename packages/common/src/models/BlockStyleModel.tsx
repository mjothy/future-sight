export default class BlockStyleModel {
  graphType = 'line';
  showLegend = false;
  showDeprecatedVersionWarning = true;
  YAxis = {
    label: false,
    unit: false,
    force0: false,
    percentage: false
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
    scenarios: {
      isCustom: false,
      value: ""
    },
    regions: {
      isCustom: false,
      value: ""
    },
    variables: {
      isCustom: false,
      value: ""
    },
    categories: {
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
  };

  colorscale = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf"
  ];
  // colorscale = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52',];

  colorbar = {
    isShow: true,
    reverse: false,
    title: {
      variable: false,
      unit: true
    }
  }
}
