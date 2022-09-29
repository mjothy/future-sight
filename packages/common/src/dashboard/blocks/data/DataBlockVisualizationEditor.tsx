import {AreaChartOutlined, BarChartOutlined, LineChartOutlined, TableOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';

const { Option } = Select;

const plotTypes = [
  {type: 'line', label: 'Line', icon: <LineChartOutlined/>},
  {type: 'bar', label: 'Bar', icon: <BarChartOutlined />},
  {type: 'area', label: 'Area', icon: <AreaChartOutlined />},
  {type: 'table', label: 'Table', icon: <TableOutlined />},
];

export default class DataBlockVisualizationEditor extends Component<any, any> {
  configStyle: BlockStyleModel = new BlockStyleModel();

  constructor(props) {
    super(props);
    this.configStyle = this.props.currentBlock.config.configStyle;
  }

  onPlotTypeChange = (selectedType: string) => {
    this.configStyle.graphType = selectedType;
    this.props.updateBlockStyleConfig(this.configStyle);
  };

  onTitleChange = (e) => {
    this.configStyle.title.value = e.target.value;
    this.props.updateBlockStyleConfig(this.configStyle);
  };

  onTitleVisibilityChange = (e) => {
    this.configStyle.title.isVisible = e.target.checked;
    this.props.updateBlockStyleConfig(this.configStyle);
  };

  onLegendChange = (e) => {
    this.configStyle.showLegend = e.target.checked;
    this.props.updateBlockStyleConfig(this.configStyle);
  };
  render() {
    this.configStyle = this.props.currentBlock.config.configStyle;

    return (
      <div>
        <Row className="mb-10">
          <Col span={2}></Col>
          <Col span={16}>
            <Select
              className="width-100"
              placeholder="Variables"
              value={this.configStyle.graphType}
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
              checked={this.configStyle.title.isVisible}
            />
          </Col>
          <Col span={16}>
            <Input
              placeholder="Title"
              value={this.configStyle.title.value}
              onChange={this.onTitleChange}
            />
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
              onChange={this.onLegendChange}
              checked={this.configStyle.showLegend}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Show legend</label>
          </Col>
        </Row>
      </div>
    );
  }
}
