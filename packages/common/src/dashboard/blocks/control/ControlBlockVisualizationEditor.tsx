import { Col, Input, Row } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';

export default class ControlBlockVisualizationEditor extends Component<any, any> {
  configStyle: BlockStyleModel = new BlockStyleModel();

  constructor(props) {
    super(props);
    this.configStyle = JSON.parse(JSON.stringify(this.props.currentBlock.config.configStyle));
  }

  onTitleChange = (e) => {
    this.configStyle.title.value = e.target.value;
    this.updateBlockConfig({ configStyle: this.configStyle })
  };

  onTitleVisibilityChange = (e) => {
    this.configStyle.title.isVisible = e.target.checked;
    this.updateBlockConfig({ configStyle: this.configStyle })
  };

  onChangeCustomSubtitle = (filterType, e) => {
    this.configStyle.subtitle[filterType].value = e.target.value;
    this.updateBlockConfig({ configStyle: this.configStyle })
  };

  onCheckCustomSubtitle = (filterType, e) => {
    this.configStyle.subtitle[filterType].isCustom = e.target.checked;
    this.updateBlockConfig({ configStyle: this.configStyle })
  };

  updateBlockConfig = (configStyle) => {
    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const config = JSON.parse(JSON.stringify(dashboard.blocks[this.props.currentBlock.id].config));
    dashboard.blocks[this.props.currentBlock.id].config = { ...config, ...configStyle };
    this.props.updateDashboard(dashboard)
  }

  getInputSubtitle = (filterType) => {
    return (
        <div key={"subtitle_" + filterType}>
          <Row>
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                  onChange={(e)=>this.onCheckCustomSubtitle(filterType, e)}
                  checked={this.configStyle.subtitle[filterType].isCustom}
              />
            </Col>
            <Col span={16} className={'checkbox-col-label'}>
              <label>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</label>
            </Col>
          </Row>
          <Row className="mb-10">
            <Col span={2}/>
            <Col span={16}>
              <Input
                  defaultValue={this.configStyle.subtitle[filterType].value}
                  onChange={(e)=>this.onChangeCustomSubtitle(filterType, e)}
                  disabled={!this.configStyle.subtitle[filterType].isCustom}
              />
            </Col>
          </Row>
        </div>
    )
  }

  render() {
    this.configStyle = JSON.parse(JSON.stringify(this.props.currentBlock.config.configStyle));

    return (
      <div>
        <h3>Title</h3>
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

        <h3>Custom labels</h3>
        {Object.keys(this.configStyle.subtitle).map((filterType) => {
          return this.getInputSubtitle(filterType)
        })}
      </div>
    );
  }
}
