import { Component } from 'react'
import { Divider, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import PlotTypes from '../../graphs/PlotTypes';
import PropTypes from 'prop-types';

// 2Types: controlled / not controlled
export default class DataBlock extends Component<any, any> {

  static propTypes = {
    structureData: PropTypes.objectOf(PropTypes.objectOf(PropTypes.objectOf(PropTypes.array)))
  }

  models: string[] = [];
  scenarios: string[] = [];
  variables: string[] = [];
  regions: string[] = [];

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const structureData = this.props.structureData;
    // models
    Object.keys(structureData).map(modelKey => {
      this.models = [...this.models, modelKey];
      // scenarios
      Object.keys(structureData[modelKey]).map(scenarioKey => {
        this.scenarios = [...this.scenarios, scenarioKey];
        // regions and variables
        this.variables = [...this.variables, ...structureData[modelKey][scenarioKey].variables];
        this.regions = [...this.regions, ...structureData[modelKey][scenarioKey].regions];
      })
    });

    // Show unique values
    this.models = [...new Set(this.models)];
    this.scenarios = [...new Set(this.scenarios)];
    this.variables = [...new Set(this.variables)];
    this.regions = [...new Set(this.regions)];
  }

  /**
   * Trigged when the list of selection models changed
   * to update the list of scenarios
   * @param selectedModels Array of names of all selected models
   */
  modelSelectionChange = (selectedModels: string[]) => {
    this.props.updateBlockMetaData({models: selectedModels});
  }

  /**
   * 
   * @param selectedScenarios 
   */
  scenariosSelectionChange = (selectedScenarios: string[]) => {
    this.props.updateBlockMetaData({scenarios: selectedScenarios});
  }

  variablesSelectionChange = (selectedVariables: string[]) => {
    this.props.updateBlockMetaData({variables: selectedVariables});
  }

  regionsSelectionChange = (selectedRegions: string[]) => {
    this.props.updateBlockMetaData({regions: selectedRegions});
  }

  plotTypeOnChange = (plotType: string) => {
    this.setState({ plotType })
  }

  render() {
    const {blocks, blockSelectedId} = this.props;
    const metaData = blocks[blockSelectedId].config.metaData;
    return (
      <div className='width-100'>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Please select the model"
          defaultValue={metaData.models}
          onChange={this.modelSelectionChange}
        >
          {
            this.models.map(model =>
              <Option key={model} value={model}>{model}</Option>
            )}
        </Select>

        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Scenario"
          defaultValue={metaData.scenarios}
          onChange={this.scenariosSelectionChange}
        >
          {
            this.scenarios.map(scenario =>
              <Option key={scenario} value={scenario}>{scenario}</Option>
            )}
        </Select>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Variables"
          defaultValue={metaData.variables}
          onChange={this.variablesSelectionChange}
        >
          {
            this.variables.map(variable =>
              <Option key={variable} value={variable}>{variable}</Option>
            )}
        </Select>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Regions"
          defaultValue={metaData.regions}
          onChange={this.regionsSelectionChange}
        >
          {
            this.regions.map(region =>
              <Option key={region} value={region}>{region}</Option>
            )}
        </Select>
        <Divider />
        <Select
          className="width-100"
          placeholder="Graph type"
          options={PlotTypes}
          onChange={this.plotTypeOnChange}
          fieldNames={{
            value: "type",
            label: "type",
          }}
        />
        <div className='space-div'></div>
      </div>
    )
  }
}
