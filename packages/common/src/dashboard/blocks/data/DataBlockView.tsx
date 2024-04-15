import React, { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import MapBlock from '../../graphs/MapBlock';
import PlotlyGraph from '../../graphs/PlotlyGraph';
import PlotlyUtils from '../../graphs/PlotlyUtils';
import * as _ from 'lodash';
import PlotDataModel from "../../../models/PlotDataModel";
import withColorizer from "../../../hoc/colorizer/withColorizer";
import {groupByGroups, stackGroups} from '../utils/StackGraphs';
import PieView from "./graphType/pie/PieView";
import BoxView from "./graphType/box/BoxView";

class DataBlockView extends Component<any, any> {

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    let shouldUpdate = true;
    const config1 = nextProps.currentBlock.config;
    const config2 = this.props.currentBlock.config;
    // Check configuration
    if (this.props.width == nextProps.width && this.props.height == nextProps.height) {
      if (_.isEqual(config1, config2)) {
        shouldUpdate = false;
      }
    }

    // Check updated plotData (we need to check this because component render before fetch finish)
    if (this.props.timeseriesData?.length != nextProps.timeseriesData?.length) {
      shouldUpdate = true;
    }

    return shouldUpdate;
  }


  getPlotData = () => {
    let data: PlotDataModel[] = this.props.timeseriesData;
    data = PlotlyUtils.filterByCustomXRange(data, this.props.currentBlock.config.configStyle)
    data = PlotlyUtils.filterByCustomYRange(data, this.props.currentBlock.config.configStyle)
    data = data.filter(element => element.data?.length > 0); // IMPORTANT: to not add plot for scenarios without data
    return data
  }

  /**
   * Preparing the fetched data to adapt plotly data OR antd table
   * @returns
   */
  settingPlotData = (data: PlotDataModel[]) => {
    const { currentBlock } = this.props;
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    const showData: any[] = [];
    let dataWithColor = [];
    let visualizeData: any = [];
    let stacks = [];
    let indexStackBy: string | undefined = undefined

    switch (configStyle.graphType) {
      case "table": {
        visualizeData = this.prepareTableData(data);
        break;
      }
      default: {
        if (configStyle.stack && configStyle.stack.isStack && (configStyle.graphType === 'area' || configStyle.graphType === 'bar')) {
          stacks = stackGroups(currentBlock.config.metaData, configStyle.stack.value);
          indexStackBy = configStyle.stack.value?.slice(0, -1)
        }

        if (configStyle.stack && configStyle.stack.isGroupBy && (configStyle.graphType === 'area' || configStyle.graphType === 'bar')) {
          stacks = groupByGroups(currentBlock.config.metaData, configStyle.stack.value);
          indexStackBy = configStyle.stack.value?.slice(0, -1)
        }

        const indexKeys = PlotlyUtils.getIndexKeys(data)
        let otherIndexes:any = indexKeys.filter(i => i !== indexStackBy)
        if(otherIndexes.length <= 0){
          otherIndexes = undefined
        }
        const colorIndex = configStyle.stack.isGroupBy ? (otherIndexes) : (indexStackBy ? [indexStackBy]: undefined);// if groupBy, 
        dataWithColor = this.props.colorizer.colorizeData(data, configStyle.colorscale, colorIndex);

        dataWithColor?.map((dataElement) => {
          showData.push(this.preparePlotData(dataElement, configStyle, stacks, indexKeys));
        });
        visualizeData = showData;
      }
    }


    let aggLine: any = null;
    if (configStyle.aggregation.isAggregate && configStyle.aggregation.type != null) {
      const graphs = ["line", "area", "bar"];
      if (graphs.includes(configStyle.graphType)) {
        let stackGroups = visualizeData.map(data => data.stackgroup);
        stackGroups = new Set(stackGroups);
        aggLine = this.getAggregationLine(visualizeData, Array.from(stackGroups));
      }
    }

    if (configStyle.graphType == "bar" && (configStyle.stack.isStack || configStyle.stack.isGroupBy ) && !!configStyle.stack.value && stacks.length > 1) {

      // Separate visualizeData into years to bypass plotly limitation on sorting multicategory xaxis

      const sortedVisualizeData: any[] = []

      for (const obj of visualizeData) {
        for (let i = 0; i < obj["y"].length; i++) {
          const obj_copy = JSON.parse(JSON.stringify(obj))
          obj_copy["x"] = [
            [obj["x"][0][i]],
            [obj["x"][1][i]]
          ]
          obj_copy["y"] = [
            obj["y"][i]
          ]
          sortedVisualizeData.push(obj_copy)
        }
      }

      sortedVisualizeData.sort((a, b) => {
        const condition = a["x"][0][0] < b["x"][0][0]
        if (condition) {
          return -1;
        }
        if (!condition) {
          return 1;
        }
        return 0;
      })

      visualizeData = sortedVisualizeData

      //stacked grouped bar chart unified legend -> only keep one legend group visible at a time
      const shownLegendName: Record<any, any>[] = []
      visualizeData.forEach((element) => {
        if (shownLegendName.includes(element["name"])) {
          element.showlegend = false
        } else {
          element.showlegend = configStyle.showLegend
          shownLegendName.push(element["name"])
        }
      })
    }

    // Add agg line
    if (aggLine != null) {
      visualizeData.push(aggLine);
    }

    return { data: visualizeData, layout: this.prepareLayout(dataWithColor, stacks) }
  }


  prepareTableData = (data: PlotDataModel[]) => {
    const columns_list = [
      'model',
      'scenario',
      'variable',
      'region'
    ];

    const values: any[] = [];
    // Generate years of column
    let years_columns = data.reduce((acc, dataElement) => {
      const years_de = dataElement.data.map(e => e.year) || [];
      // @ts-ignore
      return acc.concat(years_de);
    }, []);

    const years_set = new Set(years_columns);
    years_columns = Array.from(years_set);
    years_columns.sort((a, b) => a - b);

    data?.map((dataElement) => {
      const obj = {};

      years_columns.map((year:string) => {
        const dataPoint = dataElement.data?.find(e => e.year == year);
        obj[year] = dataPoint ? Number(dataPoint.value).toFixed(2): "-";
      });

      values.push({
        model: dataElement.model,
        scenario: dataElement.scenario,
        variable: dataElement.variable,
        region: dataElement.region,
        ...obj,
      });
    });

    const columns1 = columns_list.map((col, idx) => {
        return {
          title: col, dataIndex: col, width: 200, align:'center'
        }
    });
    const columns2 = years_columns.map((col, idx) => {
      return {
        title: col, dataIndex: col, width: 60, align:'center'
      }
    });
    return { columns: columns1.concat(columns2, [{title: "", dataIndex: "extra", width: 30, align:'center'}]), values }; // the extra column to add empty space at the end of table
  }

  preparePlotData = (dataElement: PlotDataModel, configStyle: BlockStyleModel, stacks?: undefined[], indexKeys: string[] = []) => {
    let obj;
    const xyDict = this.getXY(dataElement, configStyle);
    switch (configStyle.graphType) {
      case 'line':
        obj = {
          type: 'scatter',
          mode: "lines+markers",
          x: xyDict.x,
          y: xyDict.y,
          connectgaps: true,
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend, configStyle.showLegend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
          marker: { color: dataElement.color || null }
        };
        break;
      case 'area':
        obj = {
          type: 'scatter',
          fill: 'tonexty',
          fillcolor: dataElement.color ? dataElement.color + "50" : null,
          x: xyDict.x,
          y: xyDict.y,
          mode: "none",
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend, configStyle.showLegend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
        };
        if ((configStyle.stack.isStack || configStyle.stack.isGroupBy) && stacks != null) {
          // Add the current element to a stack (if it exist in stagGroups)
          // stack is array contains possible stacks [[{},{}], [{},{}]]
          if (stacks.length == 0) {
            obj.stackgroup = 0;
          } else {
            Object.entries(stacks).forEach(([key, val]: any) => {
              const isExist = val.find(
                raw => dataElement.model == raw["models"] &&
                  dataElement.variable == raw["variables"] &&
                  dataElement.region == raw["regions"] &&
                  dataElement.scenario == raw["scenarios"]
              )
              if (isExist) {
                obj.stackgroup = key;
              }
            })
          }
        }
        break;
      case 'bar':
        obj = {
          type: configStyle.graphType,
          x: xyDict.x,
          y: xyDict.y,
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend, configStyle.showLegend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
          marker: { color: dataElement.color || null },
        };
        if ((configStyle.stack.isStack || configStyle.stack.isGroupBy) && stacks != null) {
          if (stacks.length == 0) {
            obj.stackgroup = 0;
          } else {
            const indexStackBy = configStyle.stack.value.slice(0, -1)
            // Find which stack dataElement belongs to
            Object.entries(stacks).forEach(([key, val]: any) => {
              const isExist = val.find(
                raw => dataElement.model == raw["models"] &&
                  dataElement.variable == raw["variables"] &&
                  dataElement.region == raw["regions"] &&
                  dataElement.scenario == raw["scenarios"]
              )
              if (isExist) {

                if(configStyle.stack.isStack){
                  if (stacks.length > 0) {
                    obj.name = dataElement[indexStackBy];
                    obj.legendgroup = dataElement[indexStackBy];
                  }
                  if (stacks.length > 1) {
                    const nonStackIndex = indexKeys.filter(x => x !== indexStackBy)
                    const groupIndexName = nonStackIndex.map(idx => dataElement[idx]).join(" - ")
                    obj.x = [xyDict.x, new Array(xyDict.x.length).fill(groupIndexName)] // TODO change groupIndexName to stackIndexName
                  }
                } else  if(configStyle.stack.isGroupBy){
                  if (stacks.length > 0) {
                    const nonStackIndex = indexKeys.filter(x => x !== indexStackBy)
                    const groupIndexName = nonStackIndex.map(idx => dataElement[idx]).join(" - ")
                    obj.name = groupIndexName;
                    obj.legendgroup = groupIndexName;
                  }
                  if (stacks.length > 1) {
                    obj.x = [xyDict.x, new Array(xyDict.x.length).fill(dataElement[indexStackBy])]
                  }
                }
                obj.stackgroup = key;
              }
            })
          }
        }
        break;
      default:
        obj = {
          type: configStyle.graphType,
          x: xyDict.x,
          y: xyDict.y,
          name: PlotlyUtils.getLabel(this.getLegend(dataElement, configStyle.legend, configStyle.showLegend), this.props.width, "legendtext"),
          showlegend: configStyle.showLegend,
          hovertext: this.plotHoverText(dataElement),
          marker: { color: dataElement.color || null }
        };
    }

    return obj;
  }

  getLegend = (dataElement: PlotDataModel, legend, showLegend) => {
    if (!showLegend) {
      return dataElement.region
        + " - " + dataElement.variable
        + " - " + dataElement.scenario
        + " - " + dataElement.model
        + " - V." + dataElement.run?.version
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
      if (legend.Version && dataElement.run?.version) {
        label.push("V. " + dataElement.run?.version)
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
  getXY = (dataElement: PlotDataModel, configStyle) => {
    const XAxisConfig = configStyle.XAxis
    const step = XAxisConfig.timestep ? XAxisConfig.timestep : 1;
    const x: any[] = [];
    const y: any[] = [];
    if(XAxisConfig.useCustomRange && XAxisConfig.left > 1900 && XAxisConfig.right >= XAxisConfig.left){
      for (let year = XAxisConfig.left; year <= XAxisConfig.right; year = year + step) {
        x.push(year);
        const obj = dataElement.data?.find(e => e.year == year);
        y.push(obj ? obj.value : null);
      }
    } else {
      dataElement.data?.map((d) => {
        if (d.value !== "") {
          x.push(d.year)
          y.push(d.value)
        }
      });
    }

    return { x, y };
  };

  prepareLayout = (data, stacks: any[]) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;

    const layout: any = {
      YAxis: {
        title: {
          text: PlotlyUtils.getLabel(this.getYAxisLabel(data), this.props.height, "ytitle"),
        },
        rangemode: configStyle.YAxis.force0 ? "tozero" : "normal",
        automargin: true,
        dragmode: "zoom",
        mapbox: { style: "carto-positron", center: { lat: 38, lon: -90 }, zoom: 3 },
        margin: { r: 0, t: 0, b: 0, l: 0 },
        width: this.props.width,
        height: this.props.height,
      }
    }

    if (configStyle.graphType == "bar" && (configStyle.stack.isStack || configStyle.stack.isGroupBy)) {
      layout["orientation"] = "v"
    }

    return layout
  }

  getAggregationLine = (data, numberOfStacks) => {
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    let x: any = [];
    let y: any = [];
    let stackGroupSySum: { x, y }[] = [];
    let isTwoXAxis = false;

    if ((!configStyle.stack.isStack && !configStyle.stack.isGroupBy) || configStyle.graphType == "line") {
      data.forEach(dataElement => {
        const result = dataElement.x.map((value, index) => {
          return { x: value, y: dataElement.y[index] };
        });
        stackGroupSySum = [...stackGroupSySum, ...result]
      });
      stackGroupSySum.sort((a, b) => a.x - b.x);

      stackGroupSySum.forEach(element => {
        x.push(element.x);
        y.push(Number(element.y));
      })

      return {
        type: 'scatter',
        x: x,
        y: y,
        mode: 'lines+markers',
        line: {
          dash: 'dot'
        },
        connectgaps: true,
        showlegend: configStyle.showLegend,
        marker: { color: "black" },
        name: configStyle.aggregation.label,
        transforms: [{
          type: 'aggregate',
          groups: x,
          aggregations: [
            { target: 'y', func: configStyle.aggregation.type, enabled: true },
          ]
        }]
      }

    } else {
      for (const i of numberOfStacks) {
        let iStackGroup: any[] = [];
        data.forEach(dataElement => {
          let years = dataElement.x;
          isTwoXAxis = Array.isArray(dataElement.x[0]);
          if (isTwoXAxis) {// x = [[...years], [...]]
            years = dataElement.x[0];
          }
          if (dataElement.stackgroup == i) {
            const result = years.map((value, index) => {
              return { x: value, y: Number(dataElement.y[index]) };
            });
            iStackGroup = [...iStackGroup, ...result]
          }
        });
        const groupByYear = PlotlyUtils.ySumByYear(iStackGroup);
        stackGroupSySum = [...stackGroupSySum, ...groupByYear];
      }

      const aggLineDara: { x: number, y: number }[] = [];
      x = stackGroupSySum.map(e => e.x);
      const years: number[] = Array.from(new Set<number>(x)).sort();
      years.forEach(year => {
        const dataYear = stackGroupSySum.filter(e => e.x == year).map(e => e.y);
        aggLineDara.push({ x: year, y: PlotlyUtils.getAggregation(dataYear, configStyle.aggregation.type) });
      })
      x = aggLineDara.map(e => e.x);
      y = aggLineDara.map(e => e.y);


      return {
        type: 'scatter',
        x: isTwoXAxis ? [x, new Array(x.length).fill(configStyle.aggregation.type)] : x,
        y: y,
        mode: 'lines+markers',
        line: {
          dash: 'dot'
        },
        showlegend: configStyle.showLegend,
        marker: { color: "black" },
        name: configStyle.aggregation.label
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
    const rawData = this.getPlotData()
    const { data, layout } = this.settingPlotData(rawData);
    switch (this.props.currentBlock.config.configStyle.graphType) {
      case "pie": {
        return <PieView
          rawData={rawData}
          currentBlock={this.props.currentBlock}
          width={this.props.width}
          height={this.props.height}
        />
      }
      case "box": {
        return <BoxView
          rawData={rawData}
          currentBlock={this.props.currentBlock}
          width={this.props.width}
          height={this.props.height}
          layout={layout}
        />
      }
      case "map": {
        return <MapBlock {...this.props} data={data} layout={layout} />
      }
      default: {
        return <PlotlyGraph {...this.props} data={data} layout={layout} />;
      }
    }
  }
}

export default withColorizer(DataBlockView)
