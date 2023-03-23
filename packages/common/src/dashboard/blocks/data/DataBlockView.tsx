import type { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import MapBlock from '../../graphs/MapBlock';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import * as _ from 'lodash';
import PlotDataModel from "../../../models/PlotDataModel";
import withColorizer from "../../../hoc/colorizer/withColorizer";
import { stackGroups } from '../utils/StackGraphs';
import PieView from "./graphType/pie/PieView";
import { getColorscale } from 'react-colorscales';

class DataBlockView extends Component<any, any> {

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    let shouldUpdate = true;
    const config1 = nextProps.currentBlock.config;
    const config2 = this.props.currentBlock.config;
    // Check configuration
    if (this.props.width == nextProps.width && this.props.height == nextProps.height) {
      if (_.isEqual(config1, config2)) {
        shouldUpdate = false;
      }
    }

    // Check updatede plotData (we need to check this because component render before fetch finish)
    if (this.props.timeseriesData?.length != nextProps.timeseriesData?.length) {
      shouldUpdate = true;
    }

    return shouldUpdate;
  }


  getPlotData = () => {
    let data: PlotDataModel[] = this.props.timeseriesData;
    data = PlotlyUtils.filterByCustomXRange(data, this.props.currentBlock.config.configStyle)
    return data
  }

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = (data: PlotDataModel[]) => {
    const { currentBlock } = this.props;
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    console.log("Run settingPlotData", currentBlock.id);
    const showData: any[] = [];

    let visualizeData: any = [];
    switch (configStyle.graphType) {
      case "table": {
        visualizeData = this.prepareTableData(data);
        break;
      }
      default: {
        let stacks = null;
        if (configStyle.stack && configStyle.stack.isStack && configStyle.graphType === 'area') {
          stacks = stackGroups(currentBlock.config.metaData, configStyle.stack.value);
        }
        // const nSwatch = this.props.timeseriesData.length >= 9 ? this.props.timeseriesData.length : 9;
        // const dataWithColor = this.props.colorizer.colorizeData(data, getColorscale(configStyle.colorscale, nSwatch))
        const dataWithColor = this.props.colorizer.colorizeData(data, configStyle.colorscale);
        dataWithColor?.map((dataElement) => {
          showData.push(this.preparePlotData(dataElement, configStyle, stacks));
        });
        visualizeData = showData;
      }
    }

    return { data: visualizeData, layout: this.prepareLayout(data) }
  }


  prepareTableData = (data: PlotDataModel[]) => {
    const columns: ColumnsType<any> = [
      { title: 'model', dataIndex: 'model' },
      { title: 'scenario', dataIndex: 'scenario' },
      { title: 'variable', dataIndex: 'variable' },
      { title: 'region', dataIndex: 'region' },
    ];
    for (let year = 2005; year <= 2100; year = year + 5) {
      columns.push({
        title: year,
        dataIndex: year,
      });
    }
    const values: any[] = [];
    data?.map((dataElement) => {
      const obj = {};
      dataElement.data?.map((e) => {
        obj[e.year] = e.value;
      });
      values.push({
        model: dataElement.model,
        scenario: dataElement.scenario,
        variable: dataElement.variable,
        region: dataElement.region,
        ...obj,
      });
    });

    return { columns, values };
  }

  preparePlotData = (dataElement: PlotDataModel, configStyle: BlockStyleModel, stack?: null) => {
    let obj;
    const xyDict = this.getXY(dataElement);
    switch (configStyle.graphType) {
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tonexty',
          // fillcolor: "#FF0000"+"50",
          fillcolor: dataElement.color ? dataElement.color + "50" : null,
          x: xyDict.x,
          y: xyDict.y,
          mode: "none",
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
        };
        if (configStyle.stack.isStack && stack != null) {
          // Add the current element to a stack (if it exist in stagGroups)
          // stack is array contains possible stacks [[{},{}], [{},{}]]
          Object.entries(stack).forEach(([key, val]: any) => {
            const isExist = val.find(raw => dataElement.model == raw["models"] && dataElement.variable == raw["variables"]
              && dataElement.region == raw["regions"] && dataElement.scenario == raw["scenarios"])
            if (isExist) {
              obj.stackgroup = key;
            }
          });
        }

        break;
      default:
        obj = {
          type: configStyle.graphType,
          x: xyDict.x,
          y: xyDict.y,
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
          marker: { color: dataElement.color || null }
        };
    }

    return obj;
  }

  getLegend = (dataElement: PlotDataModel, legend) => {
    if (!legend) {
      return dataElement.region
        + " - " + dataElement.variable
        + " - " + dataElement.scenario
        + " - " + dataElement.model
    } else {
      const label: any[] = [];
      if (legend.Region && dataElement.region) {
        label.push(dataElement.region)
      }
      if (legend.Variable && dataElement.variable) {
        label.push(dataElement.variable)
      }
      if (legend.Scenario && dataElement.scenario) {
        label.push(dataElement.scenario)
      }
      if (legend.Model && dataElement.model) {
        label.push(dataElement.model)
      }
      return label.join(' - ')
    }
  }

  plotHoverText = (dataElement: PlotDataModel) => {
    let textHover = '';
    const result: string[] = [];

    dataElement.data?.map((e) => {
      textHover =
        dataElement.model +
        '/' +
        dataElement.scenario +
        '<br>' +
        'region:' +
        dataElement.region +
        '<br>' +
        'variable: ' +
        dataElement.variable;
      result.push(textHover);
    });

    return result;
  };

  /**
   * Extract the x and y axis from data
   * @param dataElement The retrieved data (from API)
   * @returns {x: x_array, y: y_array}
   */
  getXY = (dataElement: PlotDataModel) => {
    const x: any[] = [];
    const y: any[] = []
    dataElement.data?.map((d) => {
      if (d.value !== "") {
        x.push(d.year)
        y.push(d.value)
      }
    });
    return { x, y };
  };

  prepareLayout = (data) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    const layout = {
      YAxis: {
        title: {
          text: PlotlyUtils.getLabel(this.getYAxisLabel(data), this.props.height, "ytitle"),
        },
        rangemode: configStyle.YAxis.force0 ? "tozero" : "normal",
        automargin: true,
        dragmode: "zoom",
        mapbox: { style: "carto-positron", center: { lat: 38, lon: -90 }, zoom: 3 },
        margin: { r: 0, t: 0, b: 0, l: 0 },
        width: this.props.width,
        height: this.props.height,
      }
    }

    return layout
  }

  getYAxisLabel = (data: PlotDataModel[]) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    const labels = {}
    for (const dataElement of data) {
      labels[dataElement.variable] = dataElement.unit
    }
    const label: any[] = []
    for (const key of Object.keys(labels)) {
      let text;
      if (configStyle.YAxis.unit && configStyle.YAxis.label) {
        text = key + "<br>" + labels[key]
      } else if (configStyle.YAxis.unit) {
        text = labels[key]
      } else if (configStyle.YAxis.label) {
        text = key
      }
      if (text) {
        label.push(text)
      }
    }
    if (label.length > 0) {
      const uniqueItems = [...new Set(label)]
      return uniqueItems.join("<br>")
    } else {
      return undefined;
    }
  }

  render() {
    const rawData = this.getPlotData()
    const { data, layout } = this.settingPlotData(rawData);
    switch (this.props.currentBlock.config.configStyle.graphType) {
      case "pie": {
        return <PieView
          rawData={rawData}
          currentBlock={this.props.currentBlock}
          width={this.props.width}
          height={this.props.height}
        />
      }
      case "map": {
        return <MapBlock {...this.props} data={data} layout={layout} />
      }
      default: {
        return <PlotlyGraph {...this.props} data={data} layout={layout} />;
      }
    }
  }
}

export default withColorizer(DataBlockView)
