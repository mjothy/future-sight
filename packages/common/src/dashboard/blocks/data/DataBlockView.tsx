import type { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import PlotDataModel from "../../../models/PlotDataModel";

const indexToColor = {
  regions: {
    "EU27": "black",
  }
}

// Color palette from plotly and D3
const colorPalette = ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF',
  '#FECB52', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

export default class DataBlockView extends Component<any, any> {

  /**
   * Get index used in this data block. Can be a filter or a combination of filter
   * The order of the index depends on their order of appearance in the
   *  constant filters or in the future FiltersDefinition
   * @returns string index
   */
  getIndexKeys = () => {

    const currentBlock = this.props.currentBlock
    const filterKeys = Object.keys(this.props.filters)
    let indexKeys

    //Normal block
    if (!currentBlock.controlBlock){
      indexKeys = filterKeys.filter(
          (filterKey)=> currentBlock.config.metaData[filterKey].length>1
      )
    } else { //Controlled block
      const controlBlock = this.props.dashboard.blocks[currentBlock.controlBlock]
      indexKeys = filterKeys.filter(
          (filterKey) => {
            if (controlBlock.config.metaData.master[filterKey].isMaster){
              return controlBlock.config.metaData.master[filterKey].values.length>1
            }
            return currentBlock.config.metaData[filterKey].length>1
          }
      )
    }

    console.log("indexKeys", indexKeys)
    return indexKeys
  }

  /**
   * Get color of the graph curve
   * @returns string index
   */
  getColor = (dataElement) => {
    const indexKeys = this.getIndexKeys()

    if(indexKeys.length==0) {
      console.log("no index")
      return null
    }

    const indexValue = indexKeys
        .map((indexKey) => dataElement[indexKey?.slice(0, -1)]) //TODO do something better to get singular values
        .join("-")
    const indexKeysJoined = indexKeys.join("-")

    if (!indexToColor[indexKeysJoined]){
      indexToColor[indexKeysJoined]={}
    }

    if (!indexToColor[indexKeysJoined][indexValue]){
      const colorIdx = Object.keys(indexToColor[indexKeysJoined]).length % colorPalette.length
      indexToColor[indexKeysJoined][indexValue] = colorPalette[colorIdx]
    }

    const color = indexToColor[indexKeysJoined][indexValue]
    console.log(color)
    return color
  }


  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = () => {
    const { currentBlock } = this.props;
    const data: PlotDataModel[] = this.props.blockData(currentBlock);
    console.log("Run settingPlotData", currentBlock.blockType);
    const showData: any[] = [];
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    let visualizeData: any = [];
    if (configStyle.graphType === 'table') {
      visualizeData = this.prepareTableData(data);
    } else {
      data.map((dataElement) => {
        showData.push(this.preparePlotData(dataElement, configStyle));
      });
      visualizeData = showData;
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
    data.map((dataElement) => {
      const obj = {};
      dataElement.data.map((e) => {
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
    const color = this.getColor(dataElement)
    switch (configStyle.graphType) {
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tozeroy',
          // fillcolor: "#FF0000"+"50",
          fillcolor: color ? color+"50" : null,
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
          marker: {color: color}
        };
    }

    return obj;
  }

  plotHoverText = (dataElement: PlotDataModel) => {
    let textHover = '';
    const result: string[] = [];

    dataElement.data.map((e) => {
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
   * @param data The retreived data (from API)
   * @returns Axis x (array of values)
   */
  getX = (dataElement: PlotDataModel) => {
    const x: any[] = [];
    dataElement.data.map((d) => {
      if (d.value !== "") {
        x.push(d.year)
      }
    });
    return x;
  };

  /**
   * Extract the y axis from data
   * @param data The retreived data (from API)
   * @returns Axis y (array of values)
   */
  getY = (dataElement: PlotDataModel) => {
    const y: any[] = [];
    dataElement.data.map((d) => {
      if (d.value !== "") {
        y.push(d.value)
      }
    });
    return y;
  };

  prepareLayout = (data) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    return {
      YAxis: {
        title: {
          text: PlotlyUtils.getLabel(this.getYAxisLabel(data), this.props.height, "ytitle"),
        },
        rangemode: configStyle.YAxis.force0 ? "tozero" : "normal",
        automargin: true,
      }
    }
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
