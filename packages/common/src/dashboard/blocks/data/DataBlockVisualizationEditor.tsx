import { AreaChartOutlined, BarChartOutlined, EnvironmentOutlined, LineChartOutlined, TableOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select, Checkbox, Radio } from 'antd';
import { Component } from 'react';

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
  { type: 'line', label: 'Line', icon: <LineChartOutlined /> },
  { type: 'bar', label: 'Bar', icon: <BarChartOutlined /> },
  { type: 'area', label: 'Area', icon: <AreaChartOutlined /> },
  { type: 'table', label: 'Table', icon: <TableOutlined /> },
  // TODO find better icon for map
  { type: 'map', label: 'Map', icon: <EnvironmentOutlined /> },

];

const colorscales = ["Reds", "Blues", "Greens", "Viridis", "Cividis"]

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

  onColorChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.colorbar.color = e.target.value;
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

  render() {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
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
        {this.isShowGraphConfig(configStyle.graphType) &&
          <>
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
          </>}

        {this.isShowGraphConfig(configStyle.graphType) &&
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
                <label>Colors: </label>
              </Col>
            </Row>
            <Row>
              <Col span={2} />
              <Col>
                <Radio.Group options={colorscales} value={configStyle.colorbar.color} onChange={this.onColorChange} />
              </Col>
            </Row>
            <Row>
              <Col span={1} />
              <Col span={8}>
                <label>Title: </label>
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
