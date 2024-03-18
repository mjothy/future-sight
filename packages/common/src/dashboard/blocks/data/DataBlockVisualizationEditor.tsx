import { Component } from 'react';
import PieVisualizationEditor from "./graphType/pie/PieVisualizationEditor";
import {
  AreaChartOutlined, BarChartOutlined, EnvironmentOutlined, LineChartOutlined, TableOutlined, PieChartOutlined,
  ExclamationCircleOutlined, BoxPlotOutlined
} from '@ant-design/icons';
import { Col, Input, Row, Select, Checkbox, InputNumber } from 'antd';
import PlotColorscalePicker from '../utils/PlotColorscalePicker';
import BoxVisualizationEditor from "./graphType/box/BoxVisualizationEditor";


const { Option } = Select;

const PLOTLY_AGGREGATION = [
  {
    value: 'sum',
    label: 'Sum',
  },
  {
    value: 'avg',
    label: 'Average',
  },
  {
    value: 'median',
    label: 'Median',
  },
]
const plotTypes = [
  { type: 'line', label: 'Line', icon: <LineChartOutlined /> },
  { type: 'bar', label: 'Bar', icon: <BarChartOutlined /> },
  { type: 'area', label: 'Area', icon: <AreaChartOutlined /> },
  { type: 'pie', label: 'Pie', icon: <PieChartOutlined /> },
  { type: 'table', label: 'Table', icon: <TableOutlined /> },
  { type: 'map', label: 'Map', icon: <EnvironmentOutlined /> },
  { type: 'box', label: 'Boxplot', icon: <BoxPlotOutlined /> },
];

const colorbarTitle = ['variable', 'unit'];
const TIME_STEPS = [2, 5, 10, 15, 20]

export default class DataBlockVisualizationEditor extends Component<any, any> {

  onPlotTypeChange = (selectedType: string) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.graphType = selectedType;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onTitleChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.title.value = e.target.value;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onTitleVisibilityChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.title.isVisible = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onLegendChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.showLegend = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onCustomRangeChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.XAxis.useCustomRange = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onTimestepChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.XAxis.timestep = e;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onXRangeLeftChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.XAxis.left = value;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onXRangeRightChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.XAxis.right = value;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onLegendContentChange = (checkedValues) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);

    for (const key in configStyle.legend) {
      configStyle.legend[key] = false
    }
    for (const value of checkedValues) {
      configStyle.legend[value] = true;
    }

    this.updateBlockConfig({ configStyle: configStyle })
  };

  legendOptions = () => {
    const legendKeys = Object.keys(this.props.currentBlock.config.configStyle.legend)
    return legendKeys.map((att) => { return { "label": att, "value": att } });
  }

  onYAxisLabelChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.label = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onYAxisUnitChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.unit = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onYAxisForceChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.force0 = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onYAxisTickFormatChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.percentage = e.target.checked ? "%" : undefined;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onStackCheckChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.isStack = e.target.checked;
    if(e.target.checked && configStyle.stack.isGroupBy){
      configStyle.stack.isGroupBy = false;
    }
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onAggregateChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.aggregation.isAggregate = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onAggregationTypeChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.aggregation.type = value;
    configStyle.aggregation.label = PLOTLY_AGGREGATION.find(element => element.value == value)?.label;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onStackValueChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.value = value;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onAggregateValueChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.aggregation.value = value;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  updateBlockConfig = (configStyle) => {
    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const config = dashboard.blocks[this.props.currentBlock.id].config;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config, ...configStyle };
    this.props.updateDashboard(dashboard)
  }

  onColorbarChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.colorbar.isShow = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onColorbarTitleChange = (checkedValues) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.colorbar.title = {
      variable: false,
      unit: false
    }
    for (const value of checkedValues) {
      configStyle.colorbar.title[value] = true;
    }
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onReverse = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.colorbar.reverse = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  isShowGraphConfig = (block_type) => {
    return block_type != "map" && block_type != "table";
  }


  isMap = (block_type) => {
    return block_type == "map";
  }

  onColorsChange = colorscale => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.colorscale = colorscale;
    this.updateBlockConfig({ configStyle: configStyle })
  }
  private onGroupByCheckChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.isGroupBy = e.target.checked;
    if(e.target.checked && configStyle.stack.isStack) {
      configStyle.stack.isStack = false;
    }
    this.updateBlockConfig({ configStyle: configStyle })
  }

  private onGroupByValueChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.value = value;
    this.updateBlockConfig({ configStyle: configStyle })
  }


  onYAxisCustomRangeChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.useCustomRange = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  private onYRangeMinChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.min = value;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  private onYRangeMaxChange= (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.max = value;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  render() {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    const metaData = this.props.currentBlock.config.metaData;
    const legend = this.props.currentBlock.config.configStyle.legend;
    const defaultLegendOptions = Object.keys(legend).filter((key) => legend[key])
    return (
      <div>
        <h3>General</h3>
        <Row className="mb-10">
          <Col span={2} />
          <Col span={16}>
            <Select
              className="width-100"
              placeholder="Variables"
              value={configStyle.graphType}
              onChange={this.onPlotTypeChange}
            >
              {plotTypes.map((chart) => (
                <Option key={chart.type} value={chart.type}>
                  {chart.icon} {chart.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
              onChange={this.onTitleVisibilityChange}
              checked={configStyle.title.isVisible}
            />
          </Col>
          <Col span={16}>
            <Input
              placeholder="Title"
              value={configStyle.title.value}
              onChange={this.onTitleChange}
            />
          </Col>
        </Row>

        {configStyle.graphType === "pie" &&
          <PieVisualizationEditor
            optionsLabel={this.props.optionsLabel}
            onStackValueChange={this.onStackValueChange}
            onGroupByCheckChange={this.onGroupByCheckChange}
            updateBlockConfig={this.updateBlockConfig}
            plotData={this.props.plotData}
            currentBlock={this.props.currentBlock}
          />
        }

        {configStyle.graphType === "box" &&
            <BoxVisualizationEditor
                optionsLabel={this.props.optionsLabel}
                onStackValueChange={this.onStackValueChange}
                onStackCheckChange={this.onStackCheckChange}
                onGroupByCheckChange={this.onGroupByCheckChange}
                updateBlockConfig={this.updateBlockConfig}
                plotData={this.props.plotData}
                currentBlock={this.props.currentBlock}
            />
        }


        {["area", "bar"].includes(configStyle.graphType) &&
            <>
              <h3>Stack/Group</h3>
              <Row className="mb-10">
                <Col span={2} className={'checkbox-col'}>
                  <Checkbox
                      onChange={this.onStackCheckChange}
                      checked={configStyle.stack.isStack}
                  />
                </Col>
                <Col span={3} className={'checkbox-col-label'}>
                  <label>Stack</label>
                </Col>
                <Col span={2} className={'checkbox-col'}>
                  <Checkbox
                      onChange={this.onGroupByCheckChange}
                      checked={configStyle.stack.isGroupBy}
                  />
                </Col>
                <Col span={3} className={'checkbox-col-label'}>
                  <label>Group</label>
                </Col>
                <Col span={9} className={'checkbox-col-label'}>
                  <Select
                      placeholder="Select"
                      value={metaData[configStyle.stack.value]?.length > 1 ? configStyle.stack.value : null}
                      onChange={this.onStackValueChange}
                      notFoundContent={(
                          <div>
                            <ExclamationCircleOutlined/>
                            <p>Item not found.</p>
                          </div>
                      )}
                      allowClear
                      disabled={!configStyle.stack.isStack && !configStyle.stack.isGroupBy}
                      dropdownMatchSelectWidth={true}
                  >
                    {this.props.optionsLabel.map((value) => {
                          if (metaData[value].length > 1) return (
                              <Option key={value} value={value}>
                                {value}
                              </Option>
                          )
                        }
                    )}
                  </Select>
                </Col>
              </Row>
            </>
        }

        {["line", "area", "bar"].includes(configStyle.graphType) &&
          <>
            <h3>Calculations</h3>
            <Row>
              <Col span={2} className={'checkbox-col'}>
                <Checkbox
                  onChange={this.onAggregateChange}
                  checked={configStyle.aggregation.isAggregate}
                />
              </Col>
              <Col span={8}>
                <Select
                  className="width-100"
                  placeholder="Type"
                  value={configStyle.aggregation.type}
                  onChange={this.onAggregationTypeChange}
                  disabled={!configStyle.aggregation.isAggregate}
                  options={PLOTLY_AGGREGATION}
                />
              </Col>
              {/* <Col span={8} className="ml-20">
                <Select
                  placeholder="Select"
                  value={configStyle.aggregation.value}
                  onChange={this.onAggregateValueChange}
                  notFoundContent={(
                    <div>
                      <ExclamationCircleOutlined />
                      <p>Item not found.</p>
                    </div>
                  )}
                  allowClear
                  disabled={!configStyle.aggregation.isAggregate}
                  dropdownMatchSelectWidth={true}
                >
                  {this.props.optionsLabel.map((value) => {
                    if (metaData[value].length > 1) return (
                      <Option key={value} value={value}>
                        {value}
                      </Option>
                    )
                  }
                  )}
                </Select>
              </Col> */}
            </Row>
          </>
        }
        <h3>Axis</h3>
        {this.isShowGraphConfig(configStyle.graphType) &&
          <>
            {configStyle.graphType === "bar" &&
              <Row>
                <Col span={2} className={'checkbox-col'}>
                  <Checkbox
                    onChange={this.onYAxisTickFormatChange}
                    checked={configStyle.YAxis.percentage}
                  />
                </Col>
                <Col span={16} className={'checkbox-col-label'}>
                  <label>Normalize to percentage</label>
                </Col>
              </Row>
            }
            {configStyle.graphType !== "pie" &&
              <>
                <Row>
                  <Col span={2} className={'checkbox-col'}>
                    <Checkbox
                        onChange={this.onYAxisForceChange}
                        checked={configStyle.YAxis.force0}
                    />
                  </Col>
                  <Col span={16} className={'checkbox-col-label'}>
                    <label>Range of Y axis to 0</label>
                  </Col>
                </Row>
                  <Row>
                  <Col span={2} className={'checkbox-col'}>
                  <Checkbox
                  onChange={this.onYAxisLabelChange}
                  checked={configStyle.YAxis.label}
                  />
                  </Col>
                  <Col span={16} className={'checkbox-col-label'}>
                  <label>Show Y Axis label</label>
                  </Col>
                </Row>
                <Row>
                  <Col span={2} className={'checkbox-col'}>
                    <Checkbox
                      onChange={this.onYAxisUnitChange}
                      checked={configStyle.YAxis.unit}
                    />
                  </Col>
                  <Col span={16} className={'checkbox-col-label'}>
                    <label>Show Y Axis unit</label>
                  </Col>
                </Row>
              </>
            }
          </>}
        <Row className="mb-10">
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
                onChange={this.onYAxisCustomRangeChange}
                checked={configStyle.YAxis.useCustomRange}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Custom Y axis range</label>
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} />
          <Col span={8}>
            <InputNumber
                className="width-100"
                placeholder="Left"
                onChange={this.onYRangeMinChange}
                value={configStyle.YAxis.min}
                disabled={!configStyle.YAxis.useCustomRange}
            />
          </Col>
          <Col span={8} className="ml-20">
            <InputNumber
                className="width-100"
                placeholder="Right"
                onChange={this.onYRangeMaxChange}
                value={configStyle.YAxis.max}
                disabled={!configStyle.YAxis.useCustomRange}
            />
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
              onChange={this.onCustomRangeChange}
              checked={configStyle.XAxis.useCustomRange}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Custom X axis range</label>
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} />
          <Col span={8}>
            <InputNumber
              className="width-100"
              placeholder="Left"
              onChange={this.onXRangeLeftChange}
              value={configStyle.XAxis.left}
              disabled={!configStyle.XAxis.useCustomRange}
            />
          </Col>
          <Col span={8} className="ml-20">
            <InputNumber
              className="width-100"
              placeholder="Right"
              onChange={this.onXRangeRightChange}
              value={configStyle.XAxis.right}
              disabled={!configStyle.XAxis.useCustomRange}
            />
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} />
          <Col span={18} className={'checkbox-col-label'}>
            <Select
              className="width-100"
              placeholder="Time step of X"
              value={configStyle.XAxis.timestep}
              onChange={this.onTimestepChange}
              allowClear
              disabled={!configStyle.XAxis.useCustomRange}
            >
              {TIME_STEPS.map((timestep) => (
                <Option key={timestep} value={timestep}>
                  {timestep}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {this.isShowGraphConfig(configStyle.graphType)
            && configStyle.graphType != "pie"
            && configStyle.graphType != "box"
            &&
          <>
            <h3>Legend</h3>
            <Row>
              <Col span={2} className={'checkbox-col'}>
                <Checkbox
                  onChange={this.onLegendChange}
                  checked={configStyle.showLegend}
                />
              </Col>
              <Col span={16} className={'checkbox-col-label'}>
                <label>Show legend</label>
              </Col>
            </Row>

            {!(
                configStyle.graphType == "bar" && (configStyle.stack.isStack || configStyle.stack.isGroupBy) && !!configStyle.stack.value
            ) &&  <>
                <Row>
                  <Col span={2}/>
                  <Col span={8}>
                    <label>Legend info: </label>
                  </Col>
                </Row>
                <Row>
                  <Col span={2} />
                  <Col>
                  <Checkbox.Group options={this.legendOptions()} value={defaultLegendOptions} onChange={this.onLegendContentChange} />
                  </Col>
                </Row>
              </>
            }          </>}
        {configStyle.graphType != "table" &&
          <>
            <h3>Colorscale</h3>
            <Row>
              <Col span={20}>
                <PlotColorscalePicker currentBlock={this.props.currentBlock} filters={this.props.filters}
                  onColorsChange={this.onColorsChange} />
              </Col>
            </Row>
          </>
        }
        {this.isMap(configStyle.graphType) &&
          <>
            <h3>Colorbar</h3>
            <Row>
              <Col span={2} className={'checkbox-col'}>
                <Checkbox
                  onChange={this.onColorbarChange}
                  checked={configStyle.colorbar.isShow}
                />
              </Col>
              <Col span={16} className={'checkbox-col-label'}>
                <label>Show colorbar</label>
              </Col>
            </Row>
            <Row>
              <Col span={2} className={'checkbox-col'}>
                <Checkbox
                  onChange={this.onReverse}
                  checked={configStyle.colorbar.reverse}
                />
              </Col>
              <Col span={16} className={'checkbox-col-label'}>
                <label>Reverse colorscale</label>
              </Col>
            </Row>
            <Row>
              <Col span={1} />
              <Col span={8}>
                <label>Label: </label>
              </Col>
            </Row>
            <Row>
              <Col span={2} />
              <Col>
                <Checkbox.Group options={colorbarTitle} value={Object.keys(configStyle.colorbar.title).filter(k => configStyle.colorbar.title[k])} onChange={this.onColorbarTitleChange} />
              </Col>
            </Row>
          </>}
      </div>
    );
  }
}
