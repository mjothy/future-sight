import { Col, Input, Row } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';

export default class ControlBlockVisualizationEditor extends Component<any, any> {
  configStyle: BlockStyleModel;

  constructor(props) {
    super(props);
    this.configStyle = this.props.currentBlock.config.configStyle;
  }

  onTitleChange = (e) => {
    this.configStyle.title.value = e.target.value;
    this.updateBlockConfig({ configStyle: this.configStyle })
  };

  onTitleVisibilityChange = (e) => {
    this.configStyle.title.isVisible = e.target.checked;
    this.updateBlockConfig({ configStyle: this.configStyle })
  };

  updateBlockConfig = (configStyle) => {
    const dashboard = { ...this.props.dashboard };
    const config = dashboard.blocks[this.props.currentBlock.id].config;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config, ...configStyle };
    this.props.updateDashboard(dashboard)
  }

  render() {
    this.configStyle = this.props.currentBlock.config.configStyle;

    return (
      <div>
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
      </div>
    );
  }
}
