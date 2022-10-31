import { Component } from 'react';
import { Alert, Button, Col, Divider, Input, Row, Select, Tag, Tooltip } from 'antd';
import { ClearOutlined, ExclamationCircleOutlined, FrownOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

  onDropdownVisibleChange = (option, e) => {
    const metaData =
      this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData;
    if (!e && metaData[option].length > 0) {
      // Update the order of selection
      this.props.updateBlockMetaData({
        selectOrder: Array.from(
          new Set<string>([...metaData.selectOrder, option])
        ),
      }, this.props.currentBlock.id);
      const selectOptions = this.props.selectOptions.filter((e) => e != option);
      this.props.updateSelectOptions(selectOptions);
    }
  };

  clearClick = (option, e) => {
    const data = {};

    const metaData =
      this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData;
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
      }, this.props.currentBlock.id);
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
      this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData;

    return (
      !isControlled && (
        <div className={selected ? 'transition' : ''}>
          <Row className="width-100 mt-16">
            <h4>{option}</h4>
            <Input.Group compact>
              <Select
                mode="multiple"
                className={selected ? "width-90" : "width-100"}
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
                dropdownMatchSelectWidth={false}
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
              {selected && <Tooltip title="That will reset all other selections">
                <Button
                  type="default"
                  onClick={(e) => this.clearClick(option, e)}

                  icon={<ClearOutlined />}
                />
              </Tooltip>}
            </Input.Group>
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
            {controlBlock[key].map(element => {
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
    const metaData =
      this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData;

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
