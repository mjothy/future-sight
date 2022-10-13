import { Col, Row, Select } from 'antd';
import { Component } from 'react';
import ControlBlockTableSelection from '../component/ControlBlockTableSelection';
import BlockStyleModel from "../../../models/BlockStyleModel";
import { CheckCircleOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;

export default class ControlBlockView extends Component<any, any> {
  render() {
    const { currentBlock } = this.props;
    const metaData = currentBlock.config.metaData;

    const variablesSelectionChange = (selectedVariables: string[]) => {
      // Update the controlBlock data
      metaData.master['variables'].values = selectedVariables;
      this.props.updateBlockMetaData(
        { master: metaData.master },
        this.props.currentBlock.id
      );
    };

    const modelsSelectionChange = (selectedModels: string[]) => {
      // Update the controlBlock data
      metaData.master['models'].values = selectedModels;
      this.props.updateBlockMetaData(
        { master: metaData.master },
        this.props.currentBlock.id
      );
    };

    const scenariosSelectionChange = (selectedScenarios: string[]) => {
      // Update the controlBlock data
      metaData.master['scenarios'].values = selectedScenarios;
      this.props.updateBlockMetaData(
        { master: metaData.master },
        this.props.currentBlock.id
      );
    };

    const regionsSelectionChange = (selectedRegions: string[]) => {
      metaData.master['regions'].values = selectedRegions;
      this.props.updateBlockMetaData(
        { master: metaData.master },
        this.props.currentBlock.id
      );
    };
    const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle;
    return (
      <div style={{ maxHeight: this.props.height - 30, overflowY: "auto", paddingRight: "10px", paddingLeft: "10px" }}>
        {configStyle.title.isVisible ? (
          <Row>
            <Col span={24}>
              <h3>{configStyle.title.value}</h3>
            </Col>
          </Row>
        ) : undefined
        }

        {metaData.master['models'].isMaster && (
          <Row className="mb-10">
            <Col span={24}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Models"
                defaultValue={metaData.master['models'].values}
                onChange={modelsSelectionChange}
              >
                {metaData.models.map((model) => (
                  <Option key={model} value={model}>
                    {model}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        )}

        {metaData.master['scenarios'].isMaster && (
          <Row className="mb-10">
            <Col span={24}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Scenarios"
                defaultValue={metaData.master['scenarios'].values}
                onChange={scenariosSelectionChange}
              >
                {metaData.scenarios.map((scenario) => (
                  <Option key={scenario} value={scenario}>
                    {scenario}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        )}

        {metaData.master['variables'].isMaster && (
          <Row className="mb-10">
            <Col span={24}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Variables"
                defaultValue={metaData.master['variables'].values}
                onChange={variablesSelectionChange}
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
            <Col span={24} className={'checkbox-col-label'}>
              <Select
                // key={this.defaultRegions.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Regions"
                defaultValue={metaData.master['regions'].values}
                onChange={regionsSelectionChange}
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
