import { Button, Col, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import DataBlockTableSelection from '../component/DataBlockTableSelection';

const { Option } = Select;

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      variables: [],
      regions: []
    }
  }

  componentDidMount() {
    this.initialize()
  }

  initialize = () => {
    // Get all the data selected in setUp view (models, regions, variables)
    const dataStructure = this.props.dashboard.dataStructure;
    let variables: any|never[] = [];
    let regions: any|never[] = [];
    Object.keys(dataStructure).map((modelKey) => {
      Object.keys(dataStructure[modelKey]).map((scenarioKey) => {
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

    this.setState({
      variables: [...new Set(variables)],
      regions: [...new Set(regions)]
    })
  };

  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onShowTable = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    this.setState({ showTable: e.target.checked });
    metaData.master['models'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
  };

  onVariablesChange = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['variables'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
  };

  onRegionsChange = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['regions'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
  };

  variablesSelectionChange = (selectedVariables: string[]) => {
    this.props.updateBlockMetaData({ variables: selectedVariables });
  };

  regionsSelectionChange = (selectedRegions: string[]) => {
    this.props.updateBlockMetaData({ regions: selectedRegions });
  };

  render() {
    const metaData = this.props.currentBlock.config.metaData;
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
                <DataBlockTableSelection {...this.props} />
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
                key={metaData.variables.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Variables"
                value={metaData.variables}
                onChange={this.variablesSelectionChange}
              >
                {this.state.variables.map((variable) => (
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
                key={metaData.regions.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Regions"
                value={metaData.regions}
                onChange={this.regionsSelectionChange}
              >
                {this.state.regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        <div>
          <Button onClick={this.onAddControlledBlock}>Add data block</Button>
        </div>
      </>
    );
  }
}
