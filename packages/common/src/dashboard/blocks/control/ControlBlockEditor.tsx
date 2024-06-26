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
    const index = parentBlock.config.metaData.selectOrder.indexOf(option);
    // 
    let staleSelectOrder = [...parentBlock.config.metaData.selectOrder];
    if (index >= 0) {
      staleSelectOrder = [...parentBlock.config.metaData.selectOrder].slice(0, index);
    }

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

    this.props.setStaleFiltersFromSelectOrder(staleSelectOrder)
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
  }

  clearClick = (option, e) => {

    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const parentBlock = JSON.parse(JSON.stringify(this.props.currentBlock));
    const index = parentBlock.config.metaData.selectOrder.indexOf(option);
    // 
    let staleSelectOrder = [...parentBlock.config.metaData.selectOrder];
    if (index >= 0) {
      staleSelectOrder = [...parentBlock.config.metaData.selectOrder].slice(0, index);
    }

    // update data selected in block view)
    parentBlock.config.metaData.master[option].isMaster = false;
    this.props.optionsLabel.forEach(label => {
      parentBlock.config.metaData.master[label].values = []; // clear selected data in control block view
    })

    parentBlock.config.metaData[option] = [];
    parentBlock.config.metaData.selectOrder = parentBlock.config.metaData.selectOrder.filter(optionFilter => optionFilter !== option);

    dashboard.blocks[this.props.currentBlock.id].config = { ...parentBlock.config };

    // Update children (this function is mutable)
    this.updateChildsBlocks(dashboard, parentBlock);

    this.props.updateDashboard(dashboard);

    this.props.setStaleFiltersFromSelectOrder(staleSelectOrder)
  };

  onChange = (option, selectedData: string[]) => {
    if (selectedData.length <= 0) {
      this.clearClick(option, null);
    } else {
      this.props.onChange(option, selectedData);
    }
  }

  selectDropDown = (option) => {
    const metaData = this.props.currentBlock.config.metaData;

    return (
      <div className='mb-20' key={option}>
        <Checkbox
          onChange={(e) => this.onCheckChange(option, e)}
          checked={metaData.master[option].isMaster}
        >
          <h4>{option}</h4>
        </Checkbox>

        {metaData.master[option].isMaster && <SelectInput
          type={option}
          className={"width-90"}
          value={metaData[option]}
          loading={this.props.isLoadingOptions[option]}
          options={this.props.optionsData[option]}
          onChange={this.onChange}
          isClear={true}
          onClear={this.clearClick}
          onDropdownVisibleChange={this.props.onDropdownVisibleChange}
          enabled={(this.props.currentOpenedFilter == option) || (this.props.currentOpenedFilter == null)}
        />}
      </div>
    );
  };

  render() {
    return (
      <>
        <div>{this.props.optionsLabel.map((option) => this.selectDropDown(option))}</div>
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
