import { Col, Row, Select } from 'antd';
import { Component } from 'react';
import ControlBlockTableSelection from '../component/ControlBlockTableSelection';
import BlockStyleModel from "../../../models/BlockStyleModel";

const { Option } = Select;

export default class ControlBlockView extends Component<any, any> {

  variablesSelectionChange = (selectedVariables: string[]) => {
    const metaData = this.props.currentBlock.config.metaData;
    // Update the controlBlock data
    metaData.master['variables'].values = selectedVariables;
    this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
  };

  regionsSelectionChange = (selectedRegions: string[]) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['regions'].values = selectedRegions;
    this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
  };

  render() {
    const metaData = this.props.currentBlock.config.metaData;
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    return (
      <div className={'width-100 height-100'}
          style={{overflowY: "auto", paddingRight: "10px", paddingLeft: "10px",paddingTop:"6px" }}>
        {configStyle.title.isVisible ? (
            <Row>
              <Col span={24}>
                <h3>{configStyle.title.value}</h3>
              </Col>
            </Row>
          ) : undefined
        }
        {metaData.master['models'].isMaster && (
          <Row>
            <Col span={6}>
              <h4>Models: </h4>
            </Col>
            <Col span={18}>
              <ControlBlockTableSelection
                {...this.props}
                models={metaData.models}
              />
            </Col>
          </Row>
        )}

        {metaData.master['variables'].isMaster && (
          <Row className="mb-10">
            <Col span={6}>
              <h4>Variables: </h4>
            </Col>
            <Col span={18}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Variables"
                defaultValue={metaData.master['variables'].values}
                onChange={this.variablesSelectionChange}
              >
                {metaData.variables.map((variable) => (
                  <Option key={variable} value={variable}>
                    {variable}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        )}

        {metaData.master['regions'].isMaster && (
          <Row className="mb-10">
            <Col span={6}>
              <h4>Regions: </h4>
            </Col>
            <Col span={18} className={'checkbox-col-label'}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Regions"
                defaultValue={metaData.master['regions'].values}
                onChange={this.regionsSelectionChange}
              >
                {metaData.regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        )}
      </div>
    );
  }
}
