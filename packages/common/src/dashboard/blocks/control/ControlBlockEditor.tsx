import { Button, Col, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';

const { Option } = Select;

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      /**
       * the data shown in dropdown lists
       */
      data: {
        regions: new Set<string>(),
        variables: new Set<string>(),
        scenarios: new Set<string>(),
        models: new Set<string>(),
      }
    }
    this.initialize(this.state.data);
  }

  initialize = (data) => {
    // Get all the data selected in setUp view (models, regions, variables)
    const dataStructure = this.props.dashboard.dataStructure;
    const filter = this.props.selectedFilter;

    // filters contains all files.json (exp: filters["regions"] = regions.json)
    const dataOfSelectedFilter = this.props.filters[filter];

    // Get the selected values on the filter
    const selectedValuesOnFilter = dataStructure[filter].selection;

    // For all values selected on filter, get other data 
    selectedValuesOnFilter.map(value => {
      Object.keys(dataOfSelectedFilter[value]).map(e => {
        // exp: dataOfSelectedFilter["France"]["models"] -> map on models of France and add them to this.state.data.models (dataState["models"].add("model1"))
        dataOfSelectedFilter[value][e].map(variable => data[e].add(variable));
      })
      data[filter].add(value);

    });
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

  onModelsChange = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['models'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
  }

  onScenarioChange = (e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master['scenarios'].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
  }

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

  modelsSelectionChange = (selectedModels: string[]) => {
    this.props.updateBlockMetaData({ models: selectedModels });
  };

  scenariosSelectionChange = (selectedScenarios: string[]) => {
    this.props.updateBlockMetaData({ scenarios: selectedScenarios });
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
                onChange={this.onModelsChange}
                checked={metaData.master['models'].isMaster}
              />
            </Col>
            <Col span={16}>
              <Select
                key={metaData.models.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Models"
                value={metaData.models}
                onChange={this.modelsSelectionChange}
              >
                {Array.from(this.state.data.models).map((model: any) => (
                  <Option key={model} value={model}>
                    {model}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row className="mb-10">
            <Col span={2} className={'checkbox-col'}>
              <Checkbox
                onChange={this.onScenarioChange}
                checked={metaData.master['scenarios'].isMaster}
              />
            </Col>
            <Col span={16}>
              <Select
                key={metaData.models.toString()}
                mode="multiple"
                className="width-100"
                placeholder="Scenarios"
                value={metaData.scenarios}
                onChange={this.scenariosSelectionChange}
              >
                {Array.from(this.state.data.scenarios).map((scenario: any) => (
                  <Option key={scenario} value={scenario}>
                    {scenario}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

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
                {Array.from(this.state.data.variables).map((variable: any) => (
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
                {Array.from(this.state.data.regions).map((region: any) => (
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
