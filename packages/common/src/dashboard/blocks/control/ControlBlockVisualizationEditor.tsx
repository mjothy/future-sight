import { Col, Input, Row, Tooltip} from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import {InfoCircleOutlined} from "@ant-design/icons";

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
              onChange={(e) => this.onCheckCustomSubtitle(filterType, e)}
              checked={this.configStyle.subtitle[filterType].isCustom}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</label>
          </Col>
        </Row>
        <Row className="mb-10">
          <Col span={2} />
          <Col span={16}>
            <Input
              value={this.configStyle.subtitle[filterType].value}
              onChange={(e) => this.onChangeCustomSubtitle(filterType, e)}
              disabled={!this.configStyle.subtitle[filterType].isCustom}
            />
          </Col>
        </Row>
      </div>
    )
  }

  onEnableMultiselectChecked = (e) => {
    const metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
    //const configStyle = JSON.parse(JSON.stringify(this.props.currentBlock.config.configStyle));

    this.configStyle.disableMultiSelect = e.target.checked;

    if(e.target.checked){
      Object.keys(metaData.master).forEach(option => {
        if(metaData.master[option].values?.length>0) {
          metaData.master[option].values = metaData.master[option].values.slice(0, 1);
        }
      })
    }
    this.updateBlockConfig({ configStyle: this.configStyle, metaData })
  }

  render() {
    this.configStyle = JSON.parse(JSON.stringify(this.props.currentBlock.config.configStyle));

    return (
        <div>

          <div className="mb-10">
            <h3>Title</h3>
            <Row>
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

          <div className="mb-10">
            <h3>Data selection option</h3>
            <Row>

              <Col span={2} className={'checkbox-col'}>
                <Checkbox
                    onChange={this.onEnableMultiselectChecked}
                    checked={this.configStyle.disableMultiSelect}
                />
              </Col>
              <Col span={16}>
                Enable single-value selection &nbsp;
                <Tooltip placement="top" title={"User can select only one item in the control block of the dashboard.\n" +
                    "Attention: This action may change your selection if more than one item is currently selected."}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Col>
            </Row>
          </div>

          <div className="mb-10">
            <h3>Custom labels</h3>
            {Object.keys(this.configStyle.subtitle).map((filterType) => {
              return this.getInputSubtitle(filterType)
            })}
          </div>

        </div>
    );
  }
}
