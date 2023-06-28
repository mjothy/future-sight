// Colors from plotly and D3

const DEFAULT_COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', //D3
    '#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52', //plotly
];

const defaultColorizer = {
    colors: DEFAULT_COLORS,
    indexToColor: {},
    defaultIndex: null
}

export default defaultColorizer