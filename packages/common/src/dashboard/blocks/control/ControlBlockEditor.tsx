import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Row } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockModel from '../../../models/BlockModel';
import { getChildrens } from '../utils/BlockDataUtils';
import SelectInput from '../utils/SelectInput';

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {

  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onCheckChange = (option, e) => {

    const dashboard = { ...this.props.dashboard };
    const config = this.props.currentBlock.config;

    // update current block config (metadata)
    config.metaData.master[option].isMaster = e.target.checked;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config };
    config.metaData.master[option].values = [];

    // Update children
    const childrens = getChildrens(this.props.dashboard.blocks, this.props.currentBlock.id);

    if (childrens.length > 0 && e) {
      childrens.map((child: BlockModel | any) => {
        const config = child.config;
        config.metaData.selectOrder = Array.from(new Set([...child.config.metaData.selectOrder, option]));
        config.metaData.filters[option] = [];
        dashboard.blocks[child.id].config = { ...config };
      });
    }

    this.props.updateDashboard(dashboard);
  };

  clearClick = (option, e) => {

    const dashboard = { ...this.props.dashboard };
    const config = this.props.currentBlock.config;

    // update current block config (metadata)
    config.metaData.filters[option] = [];
    config.metaData.master[option].values = [];
    dashboard.blocks[this.props.currentBlock.id].config = { ...config };

    const isMaster = config.metaData.master[option].isMaster;
    if (isMaster) {
      const childrens = getChildrens(this.props.dashboard.blocks, this.props.currentBlock.id)
      childrens.forEach((child: BlockModel | any) => {
        const configChild = child.config;
        configChild.metaData.filters[option] = [];
        dashboard.blocks[child.id].config = { ...configChild };
      })
    }

    this.props.updateDashboard(dashboard);
  };

  /**
   * Called on deselect a value from Select input
   * @param option input type (models, scenarios, ...)
   * @param unselectedData deselected data
   */
  updateControlView = (option, unselectedData) => {
    // Check if the unselected value is selected in the view, if its the case update ControlBlockView and childs
    const dashboard = { ...this.props.dashboard };
    const config = this.props.currentBlock.config;
    const newValues = config.metaData.master[option].values.filter(value => value !== unselectedData);
    config.metaData.master[option].values = newValues;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config };

    const isMaster = this.props.currentBlock.config.metaData.master[option].isMaster;
    // update all the data blocks
    if (isMaster) {
      const childrens = getChildrens(this.props.dashboard.blocks, this.props.currentBlock.id)
      childrens.forEach((child: BlockModel | any) => {
        const configChild = { ...child.config };
        const newValues = configChild.metaData.filters[option].filter(value => value !== unselectedData);
        configChild.metaData.filters[option] = newValues;
        dashboard.blocks[child.id].config = { ...configChild };
      })
    }

    this.props.updateDashboard(dashboard);
  }

  selectDropDown = (option, list_key="") => {
    const metaData = this.props.currentBlock.config.metaData;

    return (
      <div className='mb-20' key={list_key}>
        <Checkbox
          onChange={(e) => this.onCheckChange(option, e)}
          checked={metaData.master[option].isMaster}
        >
          <h4>{option}</h4>
        </Checkbox>

        <SelectInput
          type={option}
          value={metaData.filters[option]}
          options={this.props.optionsData[option]}
          onChange={this.props.onChange}
          isClear={true}
          onClear={this.clearClick}
          onDeselect={this.updateControlView}
        />
      </div>
    );
  };

  render() {
    const filtersId = Object.keys(this.props.filtersDefinition);
    return (
      <>
        <div>{filtersId.map((option, idx) => this.selectDropDown(option, idx.toString()))}</div>
        <Divider />
        <Row style={{ marginTop: "auto" }}>
          <Col span={24}>
            <Button
              type="primary"
              className="width-100"
              onClick={this.onAddControlledBlock}
            >
              <PlusOutlined />Add linked data block
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}
