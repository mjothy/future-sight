/* eslint-disable prefer-const */
import {ColumnsType} from 'antd/lib/table';
import React, {Component} from 'react';
import BlockDataModel from '../../../models/BlockDataModel';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';

export default class DataBlockView extends Component<any, any> {

  constructor(props) {
    super(props);
  }

  /**
   * Getting the data to visualize on the graphf
   * @returns Data with timeseries
   */
  getPlotData = () => {
    // 2 options: if the block controlled or not
    // if the models is control, it will take the data from his master
    const { currentBlock } = this.props;
    const metaData: BlockDataModel = currentBlock.config.metaData;
    if (currentBlock.controlBlock !== '') {
      const controlBlock =
        this.props.blocks[currentBlock.controlBlock].config.metaData;
      if (controlBlock.master['models'].isMaster)
        metaData.models = controlBlock.master['models'].values;
      if (controlBlock.master['variables'].isMaster)
        metaData.variables = controlBlock.master['variables'].values;
      if (controlBlock.master['regions'].isMaster)
        metaData.regions = controlBlock.master['regions'].values;
    }
    const data: any[] = [];
    if (metaData.models && metaData.variables && metaData.variables && metaData.regions) {
      metaData.models.map((model) => {
        metaData.scenarios.map((scenario) => {
          metaData.variables.map((variable) => {
            metaData.regions.map((region) => {
              data.push({ model, scenario, variable, region });
            });
          });
        });
      });

      console.log("data: ", data)

      const returnData = this.props.getData(data);
      console.log("returnData: ", returnData);
      return returnData;
    }
  };

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = () => {
    const data: any[] = this.getPlotData();
    const showData: any[] = [];
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    let plotData;
    if (configStyle.graphType === 'table') {
      plotData =  this.prepareTableData(data);
    } else {
      data.map((dataElement) => {
        showData.push(this.preparePlotData(dataElement, configStyle));
      });
      plotData = showData;
    }
    return {data: plotData, layout: this.prepareLayout(data)}
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
      let label: any[] = [];
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
    switch (configStyle.graphType) {
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tozeroy',
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          mode: 'none',
          name: this.getLegend(dataElement, configStyle.legend),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
        };
        break;
      default:
        obj = {
          type: configStyle.graphType,
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          name: this.getLegend(dataElement, configStyle.legend),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
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
          text: this.getYAxisLabel(data)
        },
        rangemode: configStyle.YAxis.force0 ? "tozero" : "normal"
      }
    }
  }

  getYAxisLabel = (data) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    let labels = {}
    for (let dataElement of data) {
      labels[dataElement.variable] = dataElement.unit
    }
    let label: any[] = []
    for (let key of Object.keys(labels)) {
      let text;
      if (configStyle.YAxis.unit && configStyle.YAxis.label) {
        text = key + " (" + labels[key] + ") "
      } else if (configStyle.YAxis.unit) {
        text = labels[key]
      } else if (configStyle.YAxis.label) {
        text = key
      }
      if(text) {
        label.push(text)
      }
    }
    if (label.length > 0) {
      let uniqueItems = [...new Set(label)]
      return uniqueItems.join(" - ")
    } else {
      return undefined;
    }
  }

  render() {
    const {data, layout} = this.settingPlotData();
    return <PlotlyGraph {...this.props} data={data} layout={layout} />;
  }
}
