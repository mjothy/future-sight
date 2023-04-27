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

    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const parentBlock = JSON.parse(JSON.stringify(this.props.currentBlock));

    // update current block config (metadata)
    parentBlock.config.metaData.master[option].isMaster = e.target.checked;
    this.props.optionsLabel.forEach(label => {
      parentBlock.config.metaData.master[label].values = []; // clear selected data in control block view
    })

    if (!e.target.checked) {
      parentBlock.config.metaData[option] = [];
      parentBlock.config.metaData.selectOrder = parentBlock.config.metaData.selectOrder.filter(optionFilter => optionFilter !== option);
    } else {
      parentBlock.config.metaData.selectOrder.push(option)
    }

    dashboard.blocks[this.props.currentBlock.id].config = { ...parentBlock.config };

    // Update children (this function is mutable)
    this.updateChildsBlocks(dashboard, parentBlock);

    this.props.updateDashboard(dashboard);
  };

  updateChildsBlocks = (dashboard, parentBlock) => {
    const childrens = getChildrens(dashboard.blocks, parentBlock.id);
    if (childrens.length > 0) {
      childrens.map((child: BlockModel | any) => {
        const configChild = child.config;
        configChild.metaData.selectOrder = parentBlock.config.metaData.selectOrder;
        this.props.optionsLabel.forEach(option => {
          configChild.metaData[option] = [];
        })
        dashboard.blocks[child.id].config = { ...configChild };
      });
    }
    return dashboard;
  }

  clearClick = (option, e) => {

    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const parentBlock = JSON.parse(JSON.stringify(this.props.currentBlock));

    // update current block config (metadata)
    parentBlock.config.metaData.master[option].isMaster = false;
    this.props.optionsLabel.forEach(label => {
      parentBlock.config.metaData.master[label].values = []; // clear selected data in control block view
    })

    if (!e.target.checked) {

      // set higher idx filters as stale
      const index = parentBlock.config.metaData.selectOrder.indexOf(option);
      const higherIdxFilters = [...parentBlock.config.metaData.selectOrder].slice(index);
      for (const clearedFilter of higherIdxFilters) {
        this.props.setStaleFilters(clearedFilter, true)
      }

      parentBlock.config.metaData[option] = [];
      parentBlock.config.metaData.selectOrder = parentBlock.config.metaData.selectOrder.filter(optionFilter => optionFilter !== option);
    } else {
      parentBlock.config.metaData.selectOrder.push(option)
    }

    dashboard.blocks[this.props.currentBlock.id].config = { ...parentBlock.config };

    // Update children (this function is mutable)
    this.updateChildsBlocks(dashboard, parentBlock);

    this.props.updateDashboard(dashboard);
  };

  selectDropDown = (option) => {
    const metaData = this.props.currentBlock.config.metaData;

    return (
      <div className='mb-20'>
        <Checkbox
          onChange={(e) => this.onCheckChange(option, e)}
          checked={metaData.master[option].isMaster}
        >
          <h4>{option}</h4>
        </Checkbox>

        {metaData.master[option].isMaster && <SelectInput
          type={option}
          value={metaData[option]}
          loading={this.props.isLoadingOptions[option]}
          options={this.props.optionsData[option]}
          onChange={this.props.onChange}
          isClear={true}
          onClear={this.clearClick}
          onDropdownVisibleChange={this.props.onDropdownVisibleChange}
        />}
      </div>
    );
  };

  render() {
    const optionsLabel = this.props.optionsLabel;
    return (
      <>
        <div>{optionsLabel.map((option) => this.selectDropDown(option))}</div>
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
