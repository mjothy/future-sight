import { Button, Col, Row, Select } from 'antd';
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
      <Row className="mb-10">
        <Col span={2} className={'checkbox-col'}>
          <Checkbox
            onChange={(e) => this.onCheckChange(option, e)}
            checked={metaData.master[option].isMaster}
          />
        </Col>
        <Col span={16}>
          <Select
            mode="multiple"
            className="width-100"
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
        </Col>
      </Row>
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
