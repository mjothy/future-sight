import type { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import * as _ from 'lodash';
import PlotDataModel from "../../../models/PlotDataModel";
import withColorizer from "../../../hoc/colorizer/withColorizer";

interface PieDataPerYearModel {
  [year: string]: { values: string[], labels: string[] }
}

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

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = () => {
    const {currentBlock} = this.props;
    const data: any[] = this.props.blockData(currentBlock);
    console.log("Run settingPlotData", currentBlock.id);
    const showData: any[] = [];
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    let visualizeData: any = [];
    switch (configStyle.graphType) {
      case "table":
        visualizeData = this.prepareTableData(data);
        break;
      case "pie":
        visualizeData = this.preparePieData(data);
        break;
      default:
        data?.map((dataElement) => {
          showData.push(this.preparePlotData(dataElement, configStyle));
        });
        visualizeData = showData;
    }

    return { data: visualizeData, layout: this.prepareLayout(data, visualizeData) }
  }

  preparePieData = (data: PlotDataModel[]) => {
    if (data.length==0) {
      return []
    }

    const stackIndex = this.props.currentBlock.config.configStyle.stack.value.slice(0, -1)

    const otherIndex = PlotlyUtils.getIndexKeys(data)
        .filter((index) => index!==stackIndex)

    //TODO stack:{value: stackIndex}
    console.log(stackIndex, otherIndex)

    const pieData: Record<string, unknown>[] = []

    // Get data by year
    if (otherIndex.length===0){
      const pieDataPerYear: PieDataPerYearModel = {}

      for (const dataElement of data){
        for (const datapoint of dataElement.data){
          if (!pieDataPerYear[datapoint.year]){
            pieDataPerYear[datapoint.year] = {values: [], labels: []}
          }
          pieDataPerYear[datapoint.year].values.push(datapoint.value)
          pieDataPerYear[datapoint.year].labels.push(dataElement[stackIndex])
        }
      }

      const selectedYear = this.props.currentBlock.config.configStyle.XAxis.default
      const selectedData = selectedYear ? pieDataPerYear[selectedYear] : Object.values(pieDataPerYear)[0]
      pieData.push({
        type: 'pie',
        values: selectedData.values,
        labels: selectedData.labels,
        hoverinfo: 'label+value',
        hole: .4,
      })
    }
    else {
      const pieDataPerIndexValue: {[index: string]: PieDataPerYearModel} = {}

      for (const dataElement of data){

        // Define new pieChart if new indexValue introduced
        const indexValue = otherIndex.length>1
            ? otherIndex.reduce((acc, filterType, idx, arr) => {
              if (idx===arr.length-1){
                return acc + dataElement[filterType]
              }
              return acc + dataElement[filterType] + " - "
            }, "")
            : dataElement[otherIndex[0]]

        if (!pieDataPerIndexValue[indexValue]){
          pieDataPerIndexValue[indexValue]={}
        }

        // Add data per year
        const pieDataPerYear = pieDataPerIndexValue[indexValue]
        for (const datapoint of dataElement.data){
          if (pieDataPerYear[datapoint.year]){
            pieDataPerYear[datapoint.year].values.push(datapoint.value)
            pieDataPerYear[datapoint.year].labels.push(dataElement[stackIndex])
          } else {
            pieDataPerYear[datapoint.year] = {
              values: [datapoint.value],
              labels: [dataElement[stackIndex]]
            }
          }
        }
      }

      let chartCount = 0
      const chartTotal = Object.keys(pieDataPerIndexValue).length
      for (const [idx, pieDataPerYear] of Object.entries(pieDataPerIndexValue)){
        const selectedYear = this.props.currentBlock.config.configStyle.XAxis.default
        const selectedData = selectedYear ? pieDataPerYear[selectedYear] : Object.values(pieDataPerYear)[0]
        const blockRatio = this.props.width/this.props.height
        let grid = {}
        if (blockRatio<=0.6){
          grid = {
            row: chartCount,
            column: 0
          }
        } else if (blockRatio>=1.9) {
          grid = {
            row: 0,
            column: chartCount
          }
        } else {
          const blockColumns = Math.ceil(Math.sqrt(chartTotal))
          grid = {
            row: Math.floor(chartCount/blockColumns),
            column: chartCount%blockColumns
          }
        }

        pieData.push({
          type: 'pie',
          name: idx,
          values: selectedData.values,
          labels: selectedData.labels,
          hoverinfo: 'label+value',
          hole: .4,
          domain: grid
        })
        chartCount+=1
      }
    }
    return pieData
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

  preparePlotData = (dataElement: PlotDataModel, configStyle: BlockStyleModel) => {
    let obj;
    switch (configStyle.graphType) {
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tozeroy',
          // fillcolor: "#FF0000"+"50",
          fillcolor: dataElement.color ? dataElement.color + "50" : null,
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          mode: "none",
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
        };
        break;
      default:
        obj = {
          type: configStyle.graphType,
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
          marker: { color: dataElement.color || null }
        };
    }

    return obj;
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
   * Extract the x axis from data
   * @param dataElement The retreived data (from API)
   * @returns Axis x (array of values)
   */
  getX = (dataElement: PlotDataModel) => {
    const x: any[] = [];
    dataElement.data?.map((d) => {
      if (d.value !== "") {
        x.push(d.year)
      }
    });
    return x;
  };

  /**
   * Extract the y axis from data
   * @param dataElement The retreived data (from API)
   * @returns Axis y (array of values)
   */
  getY = (dataElement: PlotDataModel) => {
    const y: any[] = [];
    dataElement.data?.map((d) => {
      if (d.value !== "") {
        y.push(d.value)
      }
    });
    return y;
  };

  prepareLayout = (data, visualizationData) => {
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

    if (configStyle.graphType === "pie" && visualizationData.length>1){
[].map
      // Define grid
      const blockRatio = this.props.width/this.props.height
      if (blockRatio <= 0.6){
        layout["grid"] = {rows: visualizationData.length, columns: 1}
        layout["annotations"] = visualizationData.map((value, index, arr) => {
          return {
            showarrow: false,
            text: value.name,
            xref: "paper",
            xanchor: "left",
            yref: "paper",
            yanchor: arr.length === (index+1) ? "top" : "middle",
            x: 0.5,
            y: (visualizationData.length - (index+1)) / visualizationData.length
          }
        })
      } else if (blockRatio>=1.9){
        layout["grid"] = {rows: 1, columns: visualizationData.length}
        layout["annotations"] = visualizationData.map((value, index) => {
          return {
            showarrow: false,
            text: value.name,
            xref: "paper",
            xanchor: "center",
            yref: "paper",
            yanchor: "top",
            x: (2 * index + 1) / (2 * visualizationData.length),
            y: 0
          }
        })
      } else {
        const blockColumns = Math.ceil(Math.sqrt(visualizationData.length))
        const blockRows = Math.ceil(Math.sqrt(visualizationData.length/blockColumns))
        layout["grid"] = {
          rows: blockRows,
          columns: blockColumns}
        layout["annotations"] = visualizationData.map((value, index, arr) => {
          const x_idx = index%blockColumns
          const y_idx = Math.floor(index/blockColumns)
          return {
            showarrow: false,
            text: value.name,
            xref: "paper",
            xanchor: "center",
            yref: "paper",
            yanchor:  blockRows === (y_idx+1) ? "top" : "middle",
            x: (2 * x_idx + 1) / (2 * blockColumns),
            y: (blockRows - (y_idx+1)) / blockRows
          }
        })

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
    const { data, layout } = this.settingPlotData();
    return <PlotlyGraph {...this.props} data={data} layout={layout} />;
  }
}

export default withColorizer(DataBlockView)