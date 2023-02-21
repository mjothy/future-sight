import {AreaChartOutlined, BarChartOutlined, ExclamationCircleOutlined, LineChartOutlined, TableOutlined} from '@ant-design/icons';
import {Checkbox, Col, Input, InputNumber, Row, Select} from 'antd';
import {Component} from 'react';

const { Option } = Select;
const ATTRIBUTES = {
  Region: {

  },
  Variable: {

  },
  Scenario: {

  },
  Model: {

  }
}

const plotTypes = [
  {type: 'line', label: 'Line', icon: <LineChartOutlined/>},
  {type: 'bar', label: 'Bar', icon: <BarChartOutlined />},
  {type: 'area', label: 'Area', icon: <AreaChartOutlined />},
  {type: 'table', label: 'Table', icon: <TableOutlined />},
];

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
    configStyle.legend = {
      Model: false,
      Scenario: false,
      Region: false,
      Variable: false
    }
    for (const value of checkedValues) {
      configStyle.legend[value] = true;
    }
    this.updateBlockConfig({ configStyle: configStyle })
  };

  legendOptions = () => {
    return Object.keys(ATTRIBUTES).map((att) => { return { "label": att, "value": att } });
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
  render() {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    const metaData = this.props.currentBlock.config.metaData;
    const legend = this.props.currentBlock.config.configStyle.legend;
    const defaultLegendOptions: any[] = [];
    for (const key of Object.keys(legend)) {
      if (legend[key]) {
        defaultLegendOptions.push(key);
      }
    }
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
        <Row>
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
                  defaultValue={metaData[configStyle.stack.value]?.length > 1 ? configStyle.stack.value : null}
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
        <Row className="mb-10">
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
                onChange={this.onCustomRangeChange}
                defaultChecked={configStyle.XAxis.useCustomRange}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Custom X axis range</label>
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2}/>
          <Col span={8}>
            <InputNumber
                className="width-100"
                placeholder="Left"
                onChange={this.onXRangeLeftChange}
                defaultValue={configStyle.XAxis.left}
                disabled={!configStyle.XAxis.useCustomRange}
            />
          </Col>
          <Col span={8} className="ml-20">
            <InputNumber
                className="width-100"
                placeholder="Right"
                onChange={this.onXRangeRightChange}
                defaultValue={configStyle.XAxis.right}
                disabled={!configStyle.XAxis.useCustomRange}
            />
          </Col>
        </Row>
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
          <Col span={2}/>
          <Col span={8}>
            <label>Legend info: </label>
          </Col>
        </Row>
        <Row>
          <Col span={2}/>
          <Col>
            <Checkbox.Group options={this.legendOptions()} value={defaultLegendOptions} onChange={this.onLegendContentChange} />
          </Col>
        </Row>
      </div>
    );
  }
}
