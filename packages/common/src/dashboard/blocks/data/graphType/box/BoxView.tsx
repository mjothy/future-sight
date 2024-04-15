import React, { Component } from 'react';
import BlockStyleModel from '../../../../../models/BlockStyleModel';
import PlotlyGraph from '../../../../graphs/PlotlyGraph';
import PlotlyUtils from '../../../../graphs/PlotlyUtils';
import PlotDataModel from "../../../../../models/PlotDataModel";
import withColorizer from "../../../../../hoc/colorizer/withColorizer";

// const test = {
//     type: configStyle.graphType,
//     y: xyDict.y,
//     name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend, configStyle.showLegend), this.props.width, "legendtext"),
//     showlegend: configStyle.showLegend,
//     hoverinfo: "y",
//     marker: { color: dataElement.color || null }
// }


interface BoxDataPerYearModel {
  [year: string]: string[]
}

class BoxView extends Component<any, any> {

  constructor(props) {
    super(props);
  }

  prepareBoxData = (data: PlotDataModel[]) => {
    if (data.length == 0) {
      return { defaultPlotlyData: [] }
    }

    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle
    const stackIndex = configStyle.stack.value?.slice(0, -1)
    const otherIndex = PlotlyUtils.getIndexKeys(data).filter(
        (index) => index !== stackIndex
    )
    let dataWithColor = this.props.colorizer.colorizeData(data, configStyle.colorscale, otherIndex)
    const plotlyData: Record<string, unknown>[] = []

    // Get data by year
    if ((!configStyle.stack.isStack && !configStyle.stack.isGroupBy)|| otherIndex.length === 0) {
      const boxDataPerYear: BoxDataPerYearModel = {}
      for (const dataElement of dataWithColor) {
        for (const datapoint of dataElement.data) {
          if (!boxDataPerYear[datapoint.year]) {
            boxDataPerYear[datapoint.year] = []
          }
          boxDataPerYear[datapoint.year].push(datapoint.value)
        }
      }

      const x_box:any[] = []
      const y_box:any[] = []
      for (const [year, values] of Object.entries(boxDataPerYear)){
          y_box.push(...values)
          x_box.push(...new Array(values.length).fill(year))
      }

      plotlyData.push({
        type: 'box',
        x: x_box,
        y: y_box,
        boxpoints: configStyle.showBoxPoints ? 'all' : 'Outliers',
        name: "",
        marker: {
          // colors: colors,
          colors: configStyle.colorscale
        },
        hovertemplate: `(%{x}, %{y})`
      })
      return {
        defaultPlotlyData: plotlyData,
        pieDataPerYearList: [boxDataPerYear]
      }
    }
    else {
      if(configStyle.stack.isGroupBy){
        dataWithColor = this.props.colorizer.colorizeData(data, configStyle.colorscale, [stackIndex])
      }
      const boxDataPerIndexValue: { [index: string]: BoxDataPerYearModel } = {}
      const colorPerIndexValue: { [index: string]: string } = {}

      for (const dataElement of dataWithColor) {
        const indexValue = configStyle.stack.isGroupBy ? dataElement[stackIndex] :
            (
                otherIndex.length > 1
                ? otherIndex.reduce((acc, filterType, idx, arr) => {
                  if (idx === arr.length - 1) {
                    return acc + dataElement[filterType]
                  }
                  return acc + dataElement[filterType] + " - "
                }, "")
                : dataElement[otherIndex[0]]
            )

        // Define new pieChart if new indexValue introduced
        if (!boxDataPerIndexValue[indexValue]) {
          boxDataPerIndexValue[indexValue] = {}
        }

        // Add color to index
        colorPerIndexValue[indexValue] = dataElement.color

        // Add data per year
        const boxDataPerYear = boxDataPerIndexValue[indexValue]
        for (const datapoint of dataElement.data) {
          if (!boxDataPerYear[datapoint.year]) {
            boxDataPerYear[datapoint.year] = []
          }
          boxDataPerYear[datapoint.year].push(datapoint.value)
        }
      }

      for (const [indexValue, boxDataPerYear] of Object.entries(boxDataPerIndexValue)){
        const x_box: any[] = []
        const y_box: any[] = []
        for (const [year, values] of Object.entries(boxDataPerYear)) {
          y_box.push(...values)
          x_box.push(...new Array(values.length).fill(year))
        }

        plotlyData.push({
          type: 'box',
          x: x_box,
          y: y_box,
          name: indexValue,
          boxpoints: configStyle.showBoxPoints ? 'all' : 'Outliers',
          marker: {
            color: colorPerIndexValue[indexValue],
            colors: configStyle.colorscale
          },
          hovertemplate: `(%{x}, %{y})`
        })
      }

      return {
        defaultPlotlyData: plotlyData,
        pieDataPerYearList: Object.values(boxDataPerIndexValue),
      }
    }
  }

  render() {
    const preparedPieData = this.prepareBoxData(this.props.rawData);
    return <PlotlyGraph {...this.props} data={preparedPieData.defaultPlotlyData} layout={this.props.layout}/>;
  }
}

export default withColorizer(BoxView)
