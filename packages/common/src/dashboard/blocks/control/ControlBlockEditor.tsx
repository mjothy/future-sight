import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Row } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockModel from '../../../models/BlockModel';
import SelectInput from '../utils/SelectInput';

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {

  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onCheckChange = (option, e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master[option].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
    // Update also children
    const childrens = Object.values(this.props.dashboard.blocks).filter(
      (block: BlockModel | any) =>
        block.controlBlock === this.props.currentBlock.id
    );

    if (childrens.length > 0 && e) {
      childrens.map((child: BlockModel | any) => {
        Object.keys(metaData.master).map((option) => {
          if (metaData.master[option].isMaster) {
            // Use setState instate of mutate it directly
            const selectOrder = Array.from(
              new Set([...child.config.metaData.selectOrder, option])
            );
            this.props.updateBlockMetaData({ selectOrder }, child.id);
          }
        });
      });
    }
  };

  clearClick = (option, e) => {
    const block = this.props.dashboard.blocks[this.props.blockSelectedId];
    const metaData = block.config.metaData;

    metaData[option] = [];
    // Update the control view
    metaData.master[option].values = [];

    this.props.updateBlockMetaData({
      ...metaData
    }, this.props.currentBlock.id);

    this.props.updateDropdownData();

    // update children data blocks
    if (block.config.metaData.master[option].isMaster) {
      const childBlocks = Object.values(this.props.dashboard.blocks).filter((block: BlockModel | any) => block.controlBlock === this.props.currentBlock.id)
      childBlocks.forEach(async (block: BlockModel | any) => {
        const blockMetaData = { ...block.config.metaData };
        blockMetaData[option] = [];
        await this.props.updateBlockMetaData({ ...blockMetaData }, block.id);
      })
    }
  };

  /**
   * Called on deselect a value from Select input
   * @param option input type (models, scenarios, ...)
   * @param unselectedData deselected data
   */
  updateControlView = async (option, unselectedData) => {
    // Check if the unselected value is selected in the view, if its the case update ControlBlockView
    const metaData = { ...this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData };
    const newValues = metaData.master[option].values.filter(value => value !== unselectedData);
    metaData.master[option].values = newValues;
    await this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);

    // update all the data blocks
    if (metaData.master[option].isMaster) {
      const childBlocks = Object.values(this.props.dashboard.blocks).filter((block: BlockModel | any) => block.controlBlock === this.props.currentBlock.id)
      childBlocks.forEach(async (block: BlockModel | any) => {
        const blockMetaData = { ...block.config.metaData };
        const newValues = blockMetaData[option].filter(value => value !== unselectedData);
        blockMetaData[option] = newValues;
        await this.props.updateBlockMetaData({ ...blockMetaData }, block.id);
      })
    }
  }

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

        <SelectInput
          type={option}
          value={metaData[option]}
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
    const options = this.props.options;
    return (
      <>
        <div>{options.map((option) => this.selectDropDown(option))}</div>
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
