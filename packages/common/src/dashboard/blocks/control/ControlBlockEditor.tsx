import { Button, Col, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import DataBlockTableSelection from '../component/DataBlockTableSelection';

const { Option } = Select;

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {

  initialize = () => {
    // Get all the data selected in setUp view (models, regions, variables)
    const dataStructure = this.props.dashboard.dataStructure;
    let variables: string[] = [];
    let regions: string[] = [];
    Object.keys(dataStructure).forEach((modelKey) => {
      Object.keys(dataStructure[modelKey]).forEach((scenarioKey) => {
        variables = [
          ...variables,
          ...dataStructure[modelKey][scenarioKey].variables,
        ];
        regions = [
          ...regions,
          ...dataStructure[modelKey][scenarioKey].regions,
        ];
      });
    });

    // Show unique values
    variables = [...new Set(variables)];
    regions = [...new Set(regions)];
    return {variables, regions}
  };

  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onShowTable = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['models'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
  };

  onVariablesChange = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['variables'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
  };

  onRegionsChange = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['regions'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
  };

  variablesSelectionChange = (selectedVariables: string[]) => {
    this.props.updateBlockMetaData({ variables: selectedVariables }, this.props.currentBlock.id);
  };

  regionsSelectionChange = (selectedRegions: string[]) => {
    this.props.updateBlockMetaData({ regions: selectedRegions }, this.props.currentBlock.id);
  };

  modelsSelectionChange = (models) => {
    this.props.updateBlockMetaData({ models: models }, this.props.currentBlock.id);
  }

  render() {
    const metaData = this.props.currentBlock.config.metaData;
    const {variables, regions} = this.initialize();
    return (
      <>
        <div>
          <Row className="mb-10">
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                onChange={this.onShowTable}
                checked={metaData.master['models'].isMaster}
              />
            </Col>
            <Col span={16}>Control by Model/Scenario</Col>
          </Row>
          {metaData.master['models'].isMaster && (
            <Row className="mb-10">
              <Col span={24}>
                <DataBlockTableSelection {...this.props} onSelectChange={this.modelsSelectionChange}/>
              </Col>
            </Row>
          )}

          <Row className="mb-10">
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                onChange={this.onVariablesChange}
                checked={metaData.master['variables'].isMaster}
              />
            </Col>
            <Col span={16}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Variables"
                value={metaData.variables}
                onChange={this.variablesSelectionChange}
              >
                {variables.map((variable) => (
                  <Option key={variable} value={variable}>
                    {variable}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row className="mb-10">
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                onChange={this.onRegionsChange}
                checked={metaData.master['regions'].isMaster}
              />
            </Col>
            <Col span={16} className={'checkbox-col-label'}>
              <Select
                mode="multiple"
                className="width-100"
                placeholder="Regions"
                value={metaData.regions}
                onChange={this.regionsSelectionChange}
              >
                {regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        <div>
          <Button onClick={this.onAddControlledBlock}>Add controlled data block</Button>
        </div>
      </>
    );
  }
}
