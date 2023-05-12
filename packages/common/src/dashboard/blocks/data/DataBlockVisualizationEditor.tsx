import { Component } from 'react';
import PieVisualizationEditor from "./graphType/pie/PieVisualizationEditor";
import {
  AreaChartOutlined, BarChartOutlined, EnvironmentOutlined, LineChartOutlined, TableOutlined, PieChartOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Col, Input, Row, Select, Checkbox, InputNumber } from 'antd';
import PlotColorscalePicker from '../utils/PlotColorscalePicker';


const { Option } = Select;

const plotTypes = [
  { type: 'line', label: 'Line', icon: <LineChartOutlined /> },
  { type: 'bar', label: 'Bar', icon: <BarChartOutlined /> },
  { type: 'area', label: 'Area', icon: <AreaChartOutlined /> },
  { type: 'pie', label: 'Pie', icon: <PieChartOutlined /> },
  { type: 'table', label: 'Table', icon: <TableOutlined /> },
  { type: 'map', label: 'Map', icon: <EnvironmentOutlined /> },
];

const colorbarTitle = ['variable', 'unit'];

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

    for(const key in configStyle.legend){
      configStyle.legend[key]=false
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

  onStackCheckChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.isStack = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onStackGroupByChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.isGroupBy = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onStackValueChange = (value) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.stack.value = value;
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

  render() {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    const metaData = this.props.currentBlock.config.metaData;
    const legend = this.props.currentBlock.config.configStyle.legend;
    const defaultLegendOptions = Object.keys(legend).filter((key)=>legend[key])
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
            updateBlockConfig={this.updateBlockConfig}
            plotData={this.props.plotData}
            currentBlock={this.props.currentBlock}
          />
        }


        {configStyle.graphType == "area" &&
          <>
            <h3>Area</h3>
            <Row>
              <Col span={2} className={'checkbox-col'}>
                <Checkbox
                  onChange={this.onStackCheckChange}
                  checked={configStyle.stack.isStack}
                />
              </Col>
              <Col span={6} className={'checkbox-col-label'}>
                <label>Stack by ... </label>
              </Col>
              <Col span={9} className={'checkbox-col-label'}>
                <Select
                  placeholder="Select"
                  value={metaData[configStyle.stack.value]?.length > 1 ? configStyle.stack.value : null}
                  onChange={this.onStackValueChange}
                  notFoundContent={(
                    <div>
                      <ExclamationCircleOutlined />
                      <p>Item not found.</p>
                    </div>
                  )}
                  allowClear
                  disabled={!configStyle.stack.isStack}
                  dropdownMatchSelectWidth={false}
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

        <h3>Axis</h3>
        {this.isShowGraphConfig(configStyle.graphType) &&
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
          </>}
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

        {this.isShowGraphConfig(configStyle.graphType) && configStyle.graphType != "pie" &&
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
            <Row>
              <Col span={2} />
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
          </>}
        {configStyle.graphType != "table" &&
          <>
            <h3>Colorscale</h3>
            <Row>
              <Col span={20}>
                <PlotColorscalePicker currentBlock={this.props.currentBlock} optionsLabel={this.props.optionsLabel}
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
