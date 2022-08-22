import { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockDataModel from '../../../models/BlockDataModel';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';

export default class DataBlockView extends Component<any, any> {
  /**
   * Getting the data to visualize on the graph
   * @returns Data with timeseries
   */
  getPlotData = () => {
    const metaData: BlockDataModel = this.props.currentBlock.config.metaData;
    const data: any[] = [];
    if (metaData.models && metaData.variables && metaData.regions) {
      Object.keys(metaData.models).map((model) => {
        metaData.models[model].map((scenario) => {
          metaData.variables.map((variable) => {
            metaData.regions.map((region) => {
              data.push({ model, scenario, variable, region });
            });
          });
        });
      });
      const returnData = this.props.getData(data);
      return returnData;
    }
  };

  /**
   * Preparing the fetched data to adapt plotly data
   * @returns
   */
  settingPlotData() {
    const data: any[] = this.getPlotData();
    const showData: any[] = [];
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    if (configStyle.graphType === "table") {
      return this.prepareTableData(data);
    } else {
      data.map((dataElement) => {
        showData.push(this.preparePlotData(dataElement, configStyle));
      });

      return showData;
    }
  }

  prepareTableData(data) {
    const columns: ColumnsType<any> = [{ title: "model", dataIndex: "model" }, { title: "scenario", dataIndex: "scenario" }, { title: "variable", dataIndex: "variable" }, { title: "region", dataIndex: "region" }];
    for (let year = 2005; year <= 2100; year = year + 5) {
      columns.push({
        title: year,
        dataIndex: year
      })
    }
    const values: any[] = [];
    data.map(dataElement => {
      const obj = {}
      dataElement.data.map(e => {
        obj[e.year] = e.value;
      })
      values.push({
        model: dataElement.model, scenario: dataElement.scenario, variable: dataElement.variable,
        region: dataElement.region, ...obj
      });
    })

    return { columns, values };
  }

  preparePlotData(dataElement, configStyle) {
    let obj = {};
    switch (configStyle.graphType) {
      case "area":
        obj = {
          type: "scatter",
          fill: 'tozeroy',
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          mode: 'none',
          name: dataElement.model + '/' + dataElement.scenario,
          showlegend: configStyle.showLegend,
        };
        break;
      default:
        obj = {
          type: configStyle.graphType,
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          name: dataElement.model + '/' + dataElement.scenario,
          showlegend: configStyle.showLegend,
        };
    }

    return obj;
  }

  /**
   * Extract the x axis from data
   * @param data The retreived data (from API)
   * @returns Axis x (array of values)
   */
  getX = (data) => {
    const x: string[] = [];
    data.data.map((d) => x.push(d.year));
    return x;
  };

  /**
   * Extract the y axis from data
   * @param data The retreived data (from API)
   * @returns Axis y (array of values)
   */
  getY = (data) => {
    const y: string[] = [];
    data.data.map((d) => y.push(d.value));
    return y;
  };

  render() {
    return <PlotlyGraph {...this.props} data={this.settingPlotData()} />;
  }
}
