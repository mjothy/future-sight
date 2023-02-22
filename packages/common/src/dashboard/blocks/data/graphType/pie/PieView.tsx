import React, {Component} from 'react';
import BlockStyleModel from '../../../../../models/BlockStyleModel';
import PlotlyGraph from '../../../../graphs/PlotlyGraph';
import PlotlyUtils from '../../../../graphs/PlotlyUtils';
import PlotDataModel from "../../../../../models/PlotDataModel";
import withColorizer from "../../../../../hoc/colorizer/withColorizer";

interface PieDataPerYearModel {
  [year: string]: { values: string[], labels: string[]}
}

class PieView extends Component<any, any> {

  preparePieData = (data: PlotDataModel[]) => {
    if (data.length==0) {
      return []
    }

    const configStyle = this.props.currentBlock.config.configStyle
    const stackIndex = configStyle.stack.value.slice(0, -1)
    const otherIndex = PlotlyUtils.getIndexKeys(data)
        .filter((index) => index!==stackIndex)

    const dataWithColor = this.props.colorizer.colorizeData(data, stackIndex)

    const pieData: Record<string, unknown>[] = []

    // Get data by year
    if (otherIndex.length===0){
      const pieDataPerYear: PieDataPerYearModel = {}
      const colors: string[] = []
      for (const dataElement of dataWithColor){
        colors.push(dataElement.color)
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
        marker: {
          colors: colors
        },
        hovertemplate: `%{label} <br> %{value:.2f} ${dataWithColor[0].unit}  <extra></extra>`,
        texttemplate: configStyle.pie.showPercent ? null : `%{value:.4s}`,
        // hoverinfo: `label+value`,
        hole: configStyle.pie.isDonut? .4 : null,
      })
    }
    else {
      const pieDataPerIndexValue: {[index: string]: PieDataPerYearModel} = {}
      const colors: string[] = []

      for (const dataElement of dataWithColor){
        colors.push(dataElement.color)

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
          if (!pieDataPerYear[datapoint.year]){
            pieDataPerYear[datapoint.year] = {values: [], labels: []}
          }
          pieDataPerYear[datapoint.year].values.push(datapoint.value)
          pieDataPerYear[datapoint.year].labels.push(dataElement[stackIndex])
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
          marker: {
            colors: colors
          },
          hovertemplate: `%{label} <br> %{value:.2f} ${dataWithColor[0].unit} <extra>${idx}</extra>`,
          texttemplate: configStyle.pie.showPercent ? null : `%{value:.4s}`,
          hole: configStyle.pie.isDonut? .4 : null,
          domain: grid
        })
        chartCount+=1
      }
    }
    return pieData
  }

  preparePieLayout = (data, plotlyData) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    const layout = {}

    if (plotlyData.length>1){

      // Define grid
      const blockRatio = this.props.width/this.props.height
      if (blockRatio <= 0.6){
        layout["grid"] = {rows: plotlyData.length, columns: 1}
        layout["annotations"] = configStyle.pie.showSubtitle && plotlyData.map((value, index, arr) => {
          return {
            showarrow: false,
            text: value.name,
            xref: "paper",
            xanchor: "center",
            yref: "paper",
            yanchor: arr.length === (index+1) ? "top" : "middle",
            x: 0.5,
            y: (plotlyData.length - (index+1)) / plotlyData.length
          }
        })
      } else if (blockRatio>=1.9){
        layout["grid"] = {rows: 1, columns: plotlyData.length}
        layout["annotations"] = configStyle.pie.showSubtitle && plotlyData.map((value, index) => {
          return {
            showarrow: false,
            text: value.name,
            xref: "paper",
            xanchor: "center",
            yref: "paper",
            yanchor: "top",
            x: (2 * index + 1) / (2 * plotlyData.length),
            y: 0
          }
        })
      } else {
        const blockColumns = Math.ceil(Math.sqrt(plotlyData.length))
        const blockRows = Math.ceil(Math.sqrt(plotlyData.length/blockColumns))
        layout["grid"] = {
          rows: blockRows,
          columns: blockColumns}
        layout["annotations"] = configStyle.pie.showSubtitle && plotlyData.map((value, index, arr) => {
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

  render() {
    const plotlyData = this.preparePieData(this.props.data);
    const layout = this.preparePieLayout(this.props.data, plotlyData);
    return <PlotlyGraph {...this.props} data={plotlyData} layout={layout} />;
  }
}

export default withColorizer(PieView)