import type { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';

const indexToColor = {
  regions: {
    "EU27": "red",
    "Asia (R5)": "blue",
  },
  variables:{
    "Emissions|CO2|Energy|Supply|Electricity":"purple",
    "Emissions|CO2|Energy|Supply|Gases":"green"
  }
}

export default class DataBlockView extends Component<any, any> {

  /**
   * Get index used in this data block. Can be a filter or a combination of filter
   * The order of the index depends on their order of appearance in the
   *  constant filters or in the future FiltersDefinition
   * @returns string index
   */
  getColorIndex = () => {

    //TODO Est ce que ça sert à qqchose d'utiliser un hash vs garder un string pour une compréhension plus facile du code couleur?
    console.log("getIndex")

    const currentBlock = this.props.currentBlock
    const filterKeys = Object.keys(this.props.filters)
    let indexKeys
    //Normal block
    if (!currentBlock.controlBlock){
      indexKeys = filterKeys.filter(
          (filterKey)=> currentBlock.config.metaData[filterKey].length>1
      )
      console.log(indexKeys)
    }

    //Controlled block
    else {
      const controlBlock = this.props.dashboard.blocks[currentBlock.controlBlock]
      indexKeys = filterKeys.filter(
          (filterKey) => {
            if (controlBlock.config.metaData.master[filterKey].isMaster){
              return controlBlock.config.metaData.master[filterKey].values.length>1
            } else {
              return currentBlock.config.metaData[filterKey].length>1
            }
          }
      )
      console.log(indexKeys)
    }

     return indexKeys
  }

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = () => {
    const { currentBlock } = this.props;
    const data: any[] = this.props.blockData(currentBlock);
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

  prepareTableData = (data) => {
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

  getLegend = (dataElement, legend) => {
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

  preparePlotData = (dataElement, configStyle: BlockStyleModel) => {
    let obj;
    const colorIndex = this.getColorIndex()[0]
    let color
    if (colorIndex) {
      const indexValue = dataElement[colorIndex?.slice(0, -1)]
      color = indexToColor[colorIndex][indexValue]
      console.log(color)
    }
    switch (configStyle.graphType) {
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tozeroy',
          // fillcolor: "#FF0000"+"50",
          fillcolor: "red",
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          mode: color || null,
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
          marker: {color: color || null}
        };
    }

    return obj;
  }

  plotHoverText = (dataElement) => {
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
  getX = (data) => {
    const x: any[] = [];
    data.data.map((d) => {
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
  getY = (data) => {
    const y: any[] = [];
    data.data.map((d) => {
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

  getYAxisLabel = (data) => {
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
