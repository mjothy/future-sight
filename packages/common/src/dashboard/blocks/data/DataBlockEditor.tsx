import { Component } from 'react';
import { Divider, Row, Tag } from 'antd';
import SelectInput from '../utils/SelectInput';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getUnselectedInputOptions } from '../utils/BlockDataUtils';

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

  clearClick = (option, e) => {
    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const config = JSON.parse(JSON.stringify(this.props.currentBlock.config));

    const index = config.metaData.selectOrder.indexOf(option);
    if (index >= 0) {
      const selectOrder = [...config.metaData.selectOrder];

      for (let i = index; i < config.metaData.selectOrder.length; i++) {
        selectOrder.splice(selectOrder.indexOf(config.metaData.selectOrder[i]), 1);
        config.metaData[config.metaData.selectOrder[i]] = [];
      }
      config.metaData.selectOrder = [...selectOrder];
      dashboard.blocks[this.props.currentBlock.id].config = { ...config };
      this.props.updateDashboard(dashboard);
    }

  };

  onChange = (option, selectedData: string[]) => {
    if (selectedData.length <= 0) {
      this.clearClick(option, null);
    } else {
      this.props.onChange(option, selectedData);
    }
  }

  getMessage = (missing) => {
    let msg = '';
    missing.forEach(value => {
      msg = msg + value + ', ';
    })
    if (msg.length > 0) {
      msg = "No data for: " + msg.slice(0, -2);
    }
    return <><WarningOutlined /> {msg}</>;
  }

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
        <Row className="width-100 mt-16">
          <h4>{option} {this.props.filters[option].required ? "" : "(optional)"} &nbsp;<label className='no-data'> {this.props.isAllSelected() && this.props.missingData[option].length > 0 && this.getMessage(this.props.missingData[option])}
          </label>
          </h4>
          <SelectInput
            type={option}
            placeholder={this.props.filters[option].label}
            className={"width-90"}
            value={metaData[option]}
            options={this.props.optionsData[option]}
            onChange={this.onChange}
            isClear={selected}
            onClear={this.clearClick}
            onDropdownVisibleChange={this.props.onDropdownVisibleChange}
            isFetching={this.props.isFetching}
          />
        </Row>
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
            <h4>{key} &nbsp;<label className='no-data'> {this.props.isAllSelected() && this.props.missingData[key].length > 0 && this.getMessage(this.props.missingData[key])}
            </label>
            </h4>
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
            {getUnselectedInputOptions(this.props.currentBlock, Object.keys(this.props.filters)).map((option) => (
              <td key={option}>{this.selectDropDownInput(option, false)}</td>
            ))}
          </tr>
        </table>
      </div>
    );
  }
}
