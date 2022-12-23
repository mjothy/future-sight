import type {ColumnsType} from 'antd/lib/table';
import React, {Component} from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import FiltersDefinitionModel from "../../../models/FiltersDefinitionModel";
import PlotDataModel from "../../../models/PlotDataModel";


export default class DataBlockView extends Component<any, any> {

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = () => {
    const { currentBlock } = this.props;
    const data:PlotDataModel[] = this.props.getBlockData(currentBlock);
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
    const columns: ColumnsType<any>=[]

    for (const filter of Object.values(this.props.filtersDefinition as FiltersDefinitionModel)){
        columns.push({
            title: filter.id_singular,
            dataIndex: filter.id_singular
        })
    }

    for (let year = 2005; year <= 2100; year = year + 5) {
      columns.push({
        title: year,
        dataIndex: year,
      });
    }

    const values: any[] = [];
    data.map((dataElement) => {
      const obj = {};
      const temp_filters = Object.fromEntries(
          Object.values(this.props.filtersDefinition as FiltersDefinitionModel).map(
              (filter)=>[filter.id_singular, dataElement[filter.id_singular]]
          )
      )
      dataElement.data.map((e) => {
        obj[e.year] = e.value;
      });
      values.push({
        ...temp_filters,
        ...obj,
      });
    });

    return { columns, values };
  }

  getLegend = (dataElement: PlotDataModel, legend) => {
    if (!legend) {
      const description = Object.values(this.props.filtersDefinition as FiltersDefinitionModel)
          .map((filter)=> dataElement[filter.id_singular])
      return description.join(' - ')
    } else {
      const label: any[] = [];
      Object.values(this.props.filtersDefinition as FiltersDefinitionModel)
          .forEach((filter)=>{
            if (legend[filter.id_singular] && dataElement[filter.id_singular]) {
              label.push(dataElement[filter.id_singular])
            }
          }
          )
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

  plotHoverText = (dataElement: PlotDataModel) => {
    let textHover = '';
    const result: string[] = [];

    dataElement.data.map((e) => {
      textHover = Object.values(this.props.filtersDefinition as FiltersDefinitionModel)
              .map((filter)=> filter.label_singular + ": " + dataElement[filter.id_singular])
              .join("<br>")
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
    dataElement.data.map((d) => {
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
    dataElement.data.map((d) => {
      if (d.value !== "") {
        y.push(d.value)
      }
    });
    return y;
  };

  prepareLayout = (data: PlotDataModel[]) => {
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
    const label: any[] = []
    for (const dataElement of data) {
      const text: any[] = [];

      if (configStyle.YAxis.unit) {
        text.push(dataElement.unit);
      }

      if (configStyle.YAxis.label) {
        for (const filter of Object.values(this.props.filtersDefinition as FiltersDefinitionModel)){
          if (filter.isYAxisLabel) text.push(dataElement[filter.id_singular]);
        }
      }

      if (text.length>0) {
        label.push(text.join("<br>"));
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
