import { Component } from 'react';
import { Button, Col, Divider, Row, Select, Tooltip } from 'antd';
import { ClearOutlined, ExclamationCircleOutlined, FrownOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

  onDropdownVisibleChange = (option, e) => {
    const metaData =
      this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    if (!e && metaData[option].length > 0) {
      // Update the order of selection
      this.props.updateBlockMetaData({
        selectOrder: Array.from(
          new Set<string>([...metaData.selectOrder, option])
        ),
      });
      const selectOptions = this.props.selectOptions.filter((e) => e != option);
      this.props.updateSelectOptions(selectOptions);
    }
  };

  clearClick = (option, e) => {
    const data = {};

    const metaData =
      this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    const index = metaData.selectOrder.indexOf(option);
    if (index >= 0) {
      const selectOrder = [...metaData.selectOrder];
      const selectOptions = [...this.props.selectOptions];

      for (let i = index; i < metaData.selectOrder.length; i++) {
        selectOrder.splice(selectOrder.indexOf(metaData.selectOrder[i]), 1);
        selectOptions.push(metaData.selectOrder[i]);
        data[metaData.selectOrder[i]] = [];
      }
      this.props.updateSelectOptions(selectOptions);
      this.props.updateBlockMetaData({
        ...data,
        selectOrder: Array.from(new Set<string>([...selectOrder])),
      });
    }

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

    const control = this.props.currentBlock.config.metaData;
    const metaData =
      this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;

    return (
      !isControlled && (
        <div className={selected ? 'transition' : ''}>
          <Row className="width-100 mt-16">
            <Col span={selected ? 20 : 24}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder={option}
                value={metaData[option]}
                // Update selection on state
                onChange={(selectedData) =>
                  this.props.onChange(option, selectedData)
                }
                // on close: save data
                onDropdownVisibleChange={(e) =>
                  this.onDropdownVisibleChange(option, e)
                }
                disabled={
                  this.props.isBlockControlled && control[option].isMaster
                }
                dropdownMatchSelectWidth={true}
                notFoundContent={(
                  <div>
                    <ExclamationCircleOutlined />
                    <p>This item does not exists for your filter selections.</p>
                  </div>
                )}
              >
                {this.props.data[option].map((value) => (
                  <Option key={value} value={value}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Col>
            {selected && (
              <Col span={4}>
                <Tooltip title="That will reset all other selections">
                  <Button
                    type="default"
                    onClick={(e) => this.clearClick(option, e)}
                    danger
                    icon={<ClearOutlined />}
                  />
                </Tooltip>
              </Col>
            )}
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
          <div>
            <strong>{key}: </strong>{' '}
            {controlBlock.master[key].values.toString()}
          </div>
        );
      }
    });
  };

  render() {
    const metaData =
      this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;

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
              {this.props.selectOptions.map((option) => (
                <td key={option}>{this.selectDropDownInput(option, false)}</td>
              ))}
            </tr>
          </table>
        </div>
      </div>
    );
  }
}
