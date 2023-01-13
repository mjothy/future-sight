import type { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import BlockModel from '../../../models/BlockModel';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import { getChildrens } from '../utils/BlockDataUtils';

export default class DataBlockView extends Component<any, any> {
  constructor(props) {
    super(props);
    const { data, layout } = this.settingPlotData();
    this.state = { data, layout };
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    if (this.props.currentSelectedBlock != null && this.props.currentSelectedBlock != undefined) {
      // Set state only for current selected block
      if (this.props.currentSelectedBlock != prevProps.currentSelectedBlock) { //Check if the current block changed
        if (this.props.currentBlock.id == this.props.currentSelectedBlock.id) {
          const { data, layout } = this.settingPlotData();
          this.setState({ data, layout })
        } else if (this.props.currentSelectedBlock.blockType === 'control') { // Change child blocks if the parrent change
          const childrens = getChildrens(this.props.dashboard.blocks, this.props.currentSelectedBlock.id);
          const id_childs: (string | undefined)[] = childrens.map((child: (BlockModel | any)) => child.id)
          if (id_childs.includes(this.props.currentBlock.id)) {
            const { data, layout } = this.settingPlotData();
            this.setState({ data, layout })
          }
        }

      }
    } else if (this.props.dashboard != prevProps.dashboard || this.props.plotData.length != prevProps.plotData.length) { //if dashboard layout change, rerender all blocks
      const { data, layout } = this.settingPlotData();
      this.setState({ data, layout })
    }
    if (this.props.plotData.length != prevProps.plotData.length) {
      const { data, layout } = this.settingPlotData();
      this.setState({ data, layout })
    }
  }

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = () => {
    const { currentBlock } = this.props;
    const data: any[] = this.props.blockData(currentBlock);
    // console.log("Run settingPlotData", currentBlock.blockType);
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
    switch (configStyle.graphType) {
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tozeroy',
          x: this.getX(dataElement),
          y: this.getY(dataElement),
          mode: 'none',
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
    return <PlotlyGraph {...this.props} data={this.state.data} layout={this.state.layout} />;
  }
}
