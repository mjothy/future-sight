import { Component } from 'react'
import { Divider, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import PlotTypes from '../../graphs/PlotTypes';
import PropTypes from 'prop-types';

export default class DataBlock extends Component<any, any> {

  static propTypes = {
    structureData: PropTypes.objectOf(PropTypes.objectOf(PropTypes.objectOf(PropTypes.array)))
  }

  constructor(props) {
    super(props);
    this.state = {
      scenarios: [],
      selectedModels: [],
      selectedScenarios: [],
      selectedVariables: [],
      selectedRegions: [],

      variables: [],
      regions: [],

      data: [],

      plotType: "bar",

      visualizationData: []
    }
  }

  /**
   * Trigged when the list of selection models changed
   * to update the list of scenarios
   * @param selectedModels Array of names of all selected models
   */
  modelSelectionChange(selectedModels: string[]) {
    this.setState({ selectedModels }, () => {
      // setting scenarios after selecting models
      let scenarios: any[] = [];
      this.state.selectedModels.map((model) => {
        scenarios = [...scenarios, ...Object.keys(this.props.structureData[model])];
      });
      this.setState({ scenarios: [...new Set(scenarios)] });
      // Update variables and regions list
      this.setVariablesRegions();
    });
  }

  /**
   * 
   * @param selectedScenarios 
   */
  scenariosSelectionChange(selectedScenarios: string[]) {
    this.setState({ selectedScenarios: [...new Set(selectedScenarios)] }, () => {
      // Update variables and regions list
      this.setVariablesRegions();
    });

  }

  setVariablesRegions = () => {

    const data = this.props.structureData;
    const models = this.state.selectedModels;
    const scenarios = this.state.selectedScenarios;
    const variables: any[] = [];
    const regions: any[] = [];
    models.map(model => {
      scenarios.map(scenario => {
        if (data[model][scenario] != null) {
          variables.push(...data[model][scenario].variables)
          regions.push(...data[model][scenario].regions)
        }
      })
    })
    this.setState({ variables: [... new Set(variables)], regions: [... new Set(regions)] });
  }

  variablesSelectionChange(selectedVariables: string[]) {
    this.setState({ selectedVariables })
  }

  regionsSelectionChange(selectedRegions: string[]) {
    this.setState({ selectedRegions })
  }

  plotTypeOnChange(plotType: string) {
    this.setState({ plotType })
  }

  render() {
    const structureData = this.props.structureData;
    return (
      <div className='width-100'>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Please select the model"
          onChange={this.modelSelectionChange.bind(this)}
        >
          {
            Object.keys(structureData).map(modelKey =>
              <Option key={modelKey} value={modelKey}>{modelKey}</Option>
            )}
        </Select>

        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Scenario"
          onChange={this.scenariosSelectionChange.bind(this)}
        >
          {this.state.scenarios.map(scenario =>
            <Option key={scenario} value={scenario}>{scenario}</Option>
          )}
        </Select>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Variables"
          onChange={this.variablesSelectionChange.bind(this)}
        >
          {this.state.variables.map(variable =>
            <Option key={variable} value={variable}>{variable}</Option>
          )}
        </Select>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Regions"
          onChange={this.regionsSelectionChange.bind(this)}
        >
          {this.state.regions.map(region =>
            <Option key={region} value={region}>{region}</Option>
          )}
        </Select>
        <Divider />
        <Select
          className="width-100"
          placeholder="Graph type"
          defaultValue={this.state.plotType}
          options={PlotTypes}
          onChange={this.plotTypeOnChange.bind(this)}
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
