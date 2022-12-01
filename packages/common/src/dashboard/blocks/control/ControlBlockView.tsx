import { Col, Row, Select } from 'antd';
import { Component } from 'react';
import BlockModel from '../../../models/BlockModel';
import BlockStyleModel from '../../../models/BlockStyleModel';
import { getChildrens } from '../utils/BlockDataUtils';

const { Option } = Select;

export default class ControlBlockView extends Component<any, any> {

  onChange = (option, selectedData: string[]) => {
    const dashboard = { ...this.props.dashboard };
    const config = this.props.dashboard.blocks[this.props.currentBlock.id].config;

    // update current block config (metadata)
    config.metaData.master[option].values = selectedData;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config };

    // Update children
    const childrens = getChildrens(this.props.dashboard.blocks, this.props.currentBlock.id);

    if (childrens.length > 0) {
      childrens.map((child: BlockModel | any) => {
        const configChild = child.config;
        this.props.optionsLabel.map((option) => {
          const isMaster = config.metaData.master[option].isMaster;
          if (isMaster) {
            configChild.metaData[option] = config.metaData.master[option].values;
            dashboard.blocks[child.id].config = { ...configChild };
          }
        });
      });
    }

    this.props.updateDashboard(dashboard)
  };

  selectDropDown = (option) => {
    const metaData = this.props.currentBlock.config.metaData;
    return (
      <Row className="mb-10">
        <Col span={6}>
          <h4>{option}: </h4>
        </Col>
        <Col span={18}>
          <Select
            mode="multiple"
            className="width-100"
            placeholder={option}
            value={metaData.master[option].values}
            onChange={(e) => this.onChange(option, e)}
            dropdownMatchSelectWidth={false}
          >
            {metaData[option].map((element) => (
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
    const metaData = this.props.currentBlock.config.metaData;

    const configStyle: BlockStyleModel =
      this.props.currentBlock.config.configStyle;
    return (
      <div className={'width-100 height-100'}
        style={{ overflowY: "auto", paddingRight: "10px", paddingLeft: "10px", paddingTop: "6px" }}>
        {configStyle.title.isVisible ? (
          <Row>
            <Col span={24}>
              <h3>{configStyle.title.value}</h3>
            </Col>
          </Row>
        ) : undefined
        }

        {Object.keys(metaData.master).map((option) => {
          if (metaData.master[option].isMaster) {
            return this.selectDropDown(option);
          }
        })}
      </div>
    );
  }
}
