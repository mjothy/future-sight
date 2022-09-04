import { Button, Col, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import DataBlockTableSelection from './DataBlockTableSelection';

const { Option } = Select;

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {
  variables: string[] = [];
  regions: string[] = [];

  constructor(props) {
    super(props);
    this.initialize();
  }

  initialize = () => {
    // Get all the data selected in setUp view (models, regions, variables)
    const dataStructure = this.props.dashboard.dataStructure;
    this.variables = [];
    this.regions = [];
    Object.keys(dataStructure).map((modelKey) => {
      Object.keys(dataStructure[modelKey]).map((scenarioKey) => {
        this.variables = [
          ...this.variables,
          ...dataStructure[modelKey][scenarioKey].variables,
        ];
        this.regions = [
          ...this.regions,
          ...dataStructure[modelKey][scenarioKey].regions,
        ];
      });
    });

    // Show unique values
    this.variables = [...new Set(this.variables)];
    this.regions = [...new Set(this.regions)];
  };

  render() {
    const metaData = this.props.currentBlock.config.metaData;

    const onAddControlledBlock = () => {
      this.props.addBlock('data', this.props.blockSelectedId);
    };

    const onShowTable = (e) => {
      this.setState({ showTable: e.target.checked });
      metaData.master['models'].isMaster = e.target.checked;
      this.props.updateBlockMetaData({ master: metaData.master });
    };

    const onVariablesChange = (e) => {
      metaData.master['variables'].isMaster = e.target.checked;
      this.props.updateBlockMetaData({ master: metaData.master });
    };

    const onRegionsChange = (e) => {
      metaData.master['regions'].isMaster = e.target.checked;
      this.props.updateBlockMetaData({ master: metaData.master });
    };

    const variablesSelectionChange = (selectedVariables: string[]) => {
      this.props.updateBlockMetaData({ variables: selectedVariables });
    };

    const regionsSelectionChange = (selectedRegions: string[]) => {
      this.props.updateBlockMetaData({ regions: selectedRegions });
    };

    return (
      <>
        <div>
          <Row className="mb-10">
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                onChange={onShowTable}
                checked={metaData.master['models'].isMaster}
              />
            </Col>
            <Col span={16}>Control by Model/Scenario</Col>
          </Row>
          {metaData.master['models'].isMaster && (
            <Row className="mb-10">
              <Col span={24}>
                <DataBlockTableSelection {...this.props} />
              </Col>
            </Row>
          )}

          <Row className="mb-10">
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                onChange={onVariablesChange}
                checked={metaData.master['variables'].isMaster}
              />
            </Col>
            <Col span={16}>
              <Select
                key={metaData.variables.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Variables"
                value={metaData.variables}
                onChange={variablesSelectionChange}
              >
                {this.variables.map((variable) => (
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
                onChange={onRegionsChange}
                checked={metaData.master['regions'].isMaster}
              />
            </Col>
            <Col span={16} className={'checkbox-col-label'}>
              <Select
                key={metaData.regions.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Regions"
                value={metaData.regions}
                onChange={regionsSelectionChange}
              >
                {this.regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        <div>
          <Button onClick={onAddControlledBlock}>Add data block</Button>
        </div>
      </>
    );
  }
}
