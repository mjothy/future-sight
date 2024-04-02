import { Table } from 'antd';
import React, { Component } from 'react';
import Plot from 'react-plotly.js';

export default class PlotlyGraph extends Component<any, any> {
  getMargins = () => {
    let hasTitle = false;
    if (this.props.currentBlock !== undefined) {
      hasTitle = this.props.currentBlock.config.configStyle.title.isVisible
    }

    if (this.props.currentBlock.config.configStyle.graphType === "pie") {
      return {
        l: 10,
        r: 10,
        b: 30,
        t: hasTitle ? 25 : 5,
        pad: 4,
      }
    }

    return {
      l: this.props.currentBlock.config.configStyle.graphType == 'map' ? 10 : (this.props.layout.YAxis.title ? 60 : 40),
      r: 10,
      b: 30,
      t: hasTitle ? 25 : 5,
      pad: 4,
    }
  }

  getMaxValue(data, axis) {

    const values = data.reduce((arr, obj) => {
      return arr.concat(obj[axis]);
    }, []);

    return Math.max(...values);
  }

  getMinValue(data, axis) {
    const values = data.reduce((arr, obj) => {
      return arr.concat(obj[axis]);
    }, []);

    return Math.min(...values);
  }

  render() {
    const { currentBlock } = this.props;
    const configStyle = currentBlock.config.configStyle

    const config = {
      displayModeBar: false, // this is the line that hides the bar.
      editable: false,
      showlegend: configStyle.showLegend,
      showTitle: false,
    };
    let layout: any = {};
    if(configStyle.graphType !== 'table'){
      layout =     {
        width: this.props.width,
        height: this.props.height,
        legend: {
          // x: -0.25,
          orientation: this.props.layout.orientation || "h",
        },
        autosize: false,
        margin: this.getMargins(),
        font: {
          size: 10,
        },
        yaxis: {
          ...this.props.layout.YAxis,
          range: (configStyle.YAxis.useCustomRange && (configStyle.YAxis.min || configStyle.YAxis.max)) ? [configStyle.YAxis.min ?? this.getMinValue(this.props.data,"y"), configStyle.YAxis.max ?? this.getMaxValue(this.props.data,"y")] : null
        },
        grid: { ...this.props.layout.grid },
        annotations: this.props.layout.annotations,
        dragmode: "zoom",
        mapbox: { style: "carto-positron", center: { lat: 38, lon: -90 }, zoom: 3 },
        barmode: (configStyle.stack.isStack || configStyle.stack.isGroupBy) ? 'stack' : null,
        barnorm: configStyle.YAxis.percentage ? "percent" : "",
        boxmode: "group",
        xaxis:{
          automargin: true
        }
      };

      if (configStyle.graphType == "box"){
        layout["xaxis"]["type"] ="category"
        // TODO add range
        /* layout["xaxis"]["tickmode"] = "array"
        const years: any = [];
        for (let i = configStyle.XAxis.left; i <= configStyle.XAxis.right; i += configStyle.XAxis.timestep) years.push(i);
        layout["xaxis"]["tickvals"] =years */
      }

      if (configStyle.title.isVisible) {
        layout = {
          ...layout,
          title: configStyle.title.value,
        };
      }

      if (this.props.slidersLayout && configStyle.XAxis.useSlider) {
        layout = {
          sliders: this.props.slidersLayout,
          ...layout
        }
      }
    }


    return configStyle.graphType === 'table' && this.props.data.values.length > 0 ? (
      <Table
        // Make the height 100% of the div (not working)
        // style={{ minHeight: '100%' }}
        columns={this.props.data.columns}
        dataSource={this.props.data.values}
        pagination={false}
        scroll={{y: this.props.height - 37 }}
        bordered
      />
    ) : (
      <Plot
        key={this.props.currentBlock.id}
        data={this.props.data}
        layout={layout}
        config={config}
        frames={this.props.frames}
        onSliderChange={this.props.onSliderChange}
      />
    );
  }
}
