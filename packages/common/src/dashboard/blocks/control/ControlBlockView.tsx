import { Col, Row, Select } from 'antd';
import { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';

const { Option } = Select;

export default class ControlBlockView extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      options: Object.keys(this.props.filters),
    };
  }

  onChange = (option, selectedData: string[]) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master[option].values = selectedData;
    this.props.updateBlockMetaData(
      { master: metaData.master },
      this.props.currentBlock.id
    );

    // Update also children
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
            defaultValue={metaData.master[option].values}
            onChange={(e) => this.onChange(option, e)}
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
