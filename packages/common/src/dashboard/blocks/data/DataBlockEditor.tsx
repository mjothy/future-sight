import { Component } from 'react';
import { Divider, Row, Tag } from 'antd';
import SelectInput from '../utils/SelectInput';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { getUnselectedInputOptions } from '../utils/BlockDataUtils';

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

  onDropdownVisibleChange = (option, e) => {
    const metaData = this.props.currentBlock.config.metaData;
    if (!e && metaData[option].length > 0) {
      // Update the order of selection
      this.props.updateBlockMetaData({
        selectOrder: Array.from(
          new Set<string>([...metaData.selectOrder, option])
        ),
      }, this.props.currentBlock.id);
    }
  };

  clearClick = (option, e) => {
    const data = {};

    const metaData = this.props.currentBlock.config.metaData;
    const index = metaData.selectOrder.indexOf(option);
    if (index >= 0) {
      const selectOrder = [...metaData.selectOrder];

      for (let i = index; i < metaData.selectOrder.length; i++) {
        selectOrder.splice(selectOrder.indexOf(metaData.selectOrder[i]), 1);
        data[metaData.selectOrder[i]] = [];
      }
      this.props.updateBlockMetaData({
        ...data,
        selectOrder: Array.from(new Set<string>([...selectOrder])),
      }, this.props.currentBlock.id);
    }

    //TODO delete cuz its triggerd after component did update (dashboard update)
    this.props.updateDropdownData();
  };

  selectDropDownInput = (option, selected) => {
    // In case the block is controlled
    const id = this.props.currentBlock.controlBlock;

    let isControlled = false;
    if (id !== '') {
      const controlBlock = this.props.dashboard.blocks[id].config.metaData;
      if (controlBlock.master[option].isMaster) {
        isControlled = true;
      }
    }

    const metaData = this.props.currentBlock.config.metaData;

    return (
      !isControlled && (
        <div className={selected ? 'transition' : ''}>
          <Row className="width-100 mt-16">
            <h4>{option}</h4>
            <SelectInput
              type={option}
              value={metaData[option]}
              options={this.props.optionsData[option]}
              onChange={this.props.onChange}
              isClear={selected}
              onClear={this.clearClick}
              onDropdownVisibleChange={this.onDropdownVisibleChange}
            />
          </Row>
        </div>
      )
    );
  };

  controlledInputs = () => {
    const id = this.props.currentBlock.controlBlock;
    const controlBlock = this.props.dashboard.blocks[id].config.metaData;
    return Object.keys(controlBlock.master).map((key) => {
      if (controlBlock.master[key].isMaster) {
        return (
          <div className='mt-20'>
            <strong>{key}: </strong> <br />
            {controlBlock[key].length <= 0 ? <div>

              <p><ExclamationCircleOutlined /> No data selected</p>
            </div> : controlBlock[key].map(element => {
              let color = "default";
              if (controlBlock.master[key].values.includes(element)) {
                color = "blue";
              }
              return <Tag key={element} color={color}>{element}</Tag>
            })}
          </div>
        );
      }
    });
  };

  render() {
    const metaData = this.props.currentBlock.config.metaData;

    return (
      <div>
        <div className={'block-flex'}>
          {/* show inputs if they are controlled */}
          {this.props.currentBlock.controlBlock !== '' && (
            <div>
              <strong>Controlled inputs</strong>
              {this.controlledInputs()}
              <Divider />
            </div>
          )}

          {/* show dropdown lists of selected  */}
          {metaData.selectOrder.map((option) =>
            this.selectDropDownInput(option, true)
          )}
          <Divider />
          {/* show dropdown lists of unselected  */}
          <table className="width-100">
            <tr>
              {getUnselectedInputOptions(this.props.currentBlock, this.props.options).map((option) => (
                <td key={option}>{this.selectDropDownInput(option, false)}</td>
              ))}
            </tr>
          </table>
        </div>
      </div>
    );
  }
}
