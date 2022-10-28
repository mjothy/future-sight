import { ClearOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Tooltip } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component, MouseEvent } from 'react';
import BlockModel from '../../../models/BlockModel';

const { Option } = Select;

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {
  clearClick(option: any, e: MouseEvent<HTMLElement, MouseEvent>): void {
    throw new Error('Method not implemented.');
  }
  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onCheckChange = (option, e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master[option].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
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
            className="width-80"
            placeholder={option}
            value={metaData[option]}
            onChange={(selectedData) =>
              this.props.onChange(option, selectedData)
            }
          >
            {Array.from(this.props.data[option]).map((element: any) => (
              <Option key={element} value={element}>
                {element}
              </Option>
            ))}
          </Select>
        </Input.Group>

      </div>
    );
  };

  render() {
    const options = Object.keys(this.props.filters);
    return (
      <>
        <div>{options.map((option) => this.selectDropDown(option))}</div>
        <div>
          <Button onClick={this.onAddControlledBlock}>Add data block</Button>
        </div>
      </>
    );
  }
}
