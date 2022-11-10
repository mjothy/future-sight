import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Input, Row, Select, Tooltip } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockModel from '../../../models/BlockModel';

const { Option } = Select;

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
    metaData.master[option].values = [];

    // TODO update children data blocks
    this.props.updateBlockMetaData({
      ...metaData
    }, this.props.currentBlock.id);

    this.props.updateDropdownData();
  };

  updateControlView = async (option, selectedData) => {
    // Check if the unselected value is selected in the view, if its the case update ControlBlockView
    const metaData = { ...this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData };

    const isSelected = metaData.master[option].values.includes(selectedData);
    if (isSelected) {
      const newValues = metaData.master[option].values.filter(value => value !== selectedData);
      metaData.master[option].values = newValues;
      await this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);

      // update all the data blocks
      const childBlocks = Object.values(this.props.dashboard.blocks).filter((block: BlockModel | any) => block.controlBlock === this.props.currentBlock.id)
      childBlocks.forEach(async (block: BlockModel | any) => {
        const blockMetaData = { ...block.config.metaData };
        const newValues = blockMetaData[option].filter(value => value !== selectedData);
        blockMetaData[option] = newValues;
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
        <Input.Group compact>
          <Select
            mode="multiple"
            className="width-90"
            placeholder={option}
            value={metaData[option]}
            onChange={(selectedData) =>
              this.props.onChange(option, selectedData)
            }
            onDeselect={(selectedData) => this.updateControlView(option, selectedData)}
          >
            {Array.from(this.props.data[option]).map((element: any) => (
              <Option key={element} value={element}>
                {element}
              </Option>
            ))}
          </Select>
          <Tooltip title="That will reset all other selections">
            <Button
              type="default"
              onClick={(e) => this.clearClick(option, e)}

              icon={<CloseCircleOutlined />}
            />
          </Tooltip>
        </Input.Group>

      </div>
    );
  };

  render() {
    const options = Object.keys(this.props.filters);
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
