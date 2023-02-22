import type { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import * as _ from 'lodash';
import PlotDataModel from "../../../models/PlotDataModel";
import withColorizer from "../../../hoc/colorizer/withColorizer";
import { stackGroups } from '../utils/StackGraphs';
import PieView from "./graphType/pie/PieView";

class DataBlockView extends Component<any, any> {

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    let shouldUpdate = true;
    const config1 = nextProps.currentBlock.config;
    const config2 = this.props.currentBlock.config;
    // Check configuration
    if (this.props.width == nextProps.width && this.props.height == nextProps.height) {
      if (_.isEqual(config1.metaData, config2.metaData) && _.isEqual(config1.configStyle, config2.configStyle)) {
        shouldUpdate = false;
      }
    }

    // Check updatede plotData (we need to check this because component render before fetch finish)
    if (this.props.blockPlotData?.length != nextProps.blockPlotData?.length) {
      shouldUpdate = true;
    }

    // if type is controlled control and control block updated -> update also child
    if (nextProps.currentBlock.controlBlock !== '') {
      const parrent_block_config1 = nextProps.dashboard.blocks[nextProps.currentBlock.controlBlock].config;
      const parrent_block_config2 = this.props.dashboard.blocks[nextProps.currentBlock.controlBlock].config;
      if (!_.isEqual(parrent_block_config1.metaData, parrent_block_config2.metaData)) {
        shouldUpdate = true;
      }

    }

    return shouldUpdate;
  }


  getPlotData = () => {
    let data: PlotDataModel[] = this.props.blockData(this.props.currentBlock);
    data = this.filterByCustomXRange(data)
    return data
  }

  filterByCustomXRange = (plotData: PlotDataModel[]) => {
    const XAxisConfig = this.props.currentBlock.config.configStyle.XAxis
    const data = JSON.parse(JSON.stringify(plotData))

    if(!XAxisConfig.useCustomRange || !XAxisConfig.left || !XAxisConfig.right){
      return data
    }

    for (let i = 0; i < data.length; i++) {
      const dataElement = data[i]
      const dataPoints = [...dataElement.data]
      dataElement.data = dataPoints.filter(
          (dataPoint) =>
              XAxisConfig.left <= dataPoint.year &&
              dataPoint.year<=XAxisConfig.right)
    }
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
        if (configStyle.stack.isStack && configStyle.graphType === 'area') {
          stacks = stackGroups(currentBlock.config.metaData, configStyle.stack.value);
        }
        const dataWithColor = this.props.colorizer.colorizeData(data)
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
          fill: 'tozeroy',
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
    return {x,y};
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
    switch (this.props.currentBlock.config.configStyle.graphType) {
      case "pie":{
        return <PieView
            rawData={rawData}
            currentBlock={this.props.currentBlock}
            width={this.props.width}
            height={this.props.height}
        />
      }
      default: {
        const { data, layout } = this.settingPlotData(rawData);
        return <PlotlyGraph {...this.props} data={data} layout={layout} />;
      }
    }
  }
}

export default withColorizer(DataBlockView)