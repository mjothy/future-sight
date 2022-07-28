import { Component } from 'react'
import { Button, Divider, Select } from 'antd';

export default class DataBlock extends Component<any, any> {

  constructor(props) {
    super(props);
    this.modelSelectionChange = this.modelSelectionChange.bind(this);
    this.scenariosSelectionChange = this.scenariosSelectionChange.bind(this);
    this.variablesSelectionChange = this.variablesSelectionChange.bind(this);

    this.state = {
      scenarios: [],
      selectedModel: {},
      selectedScenario: {},
      selectedVariable: {},

    }
  }

  /**
   * Trigged when the list of selection models changed
   * to update the list of scenarios
   */
  modelSelectionChange(modelSelected: string) {
    const selectedModel = this.props.structureData.models.filter(model => model.name === modelSelected)[0];
    this.setState({ selectedModel, scenarios: selectedModel.scenarios, selectedScenario: {} });
  }

  scenariosSelectionChange(selectedScenario: string) {
    const scenario = this.state.selectedModel.scenarios.filter(scenario => scenario.name === selectedScenario)[0];
    const variables = (this.props.structureData.variables.filter(variable => variable.model === this.state.selectedModel.name && variable.scenario === selectedScenario)[0]).variables;
    this.setState({ selectedScenario: scenario, variables });
  }

  variablesSelectionChange(variable: string) {

    const data = {
      model: this.state.selectedModel.name,
      scenario: this.state.selectedScenario.name,
      variable: variable
    }

    this.props.dataManager.fetchRegions(data).then(regions =>
      this.setState({ regions })
    )
  }

  addDataBlock = () => {
    // Add datablock
  }

  render() {
    return (
      <div className='width-100'>
        <Divider />
        <Select
          className="width-100"
          placeholder="Please select the model"
          options={this.props.structureData.models}
          onChange={this.modelSelectionChange}
          fieldNames={{
            value: "name",
            label: "name",
          }}
        />

        <Divider />
        <Select
          className="width-100"
          placeholder="Scenario"
          value={this.state.selectedScenario.name}
          options={this.state.scenarios}
          onChange={this.scenariosSelectionChange}
          fieldNames={{
            value: "name",
            label: "name",
          }}
        />
        <Divider />
        <Select
          className="width-100"
          placeholder="Variable"
          options={this.state.variables}
          onChange={this.variablesSelectionChange}
          fieldNames={{
            value: "name",
            label: "name",
          }}
        />
        <Divider />
        <Select
          className="width-100"
          placeholder="Regions"
          options={this.state.regions}
          fieldNames={{
            value: "name",
            label: "name",
          }}
        />
        <Divider />
        <Button type='primary' className='width-100'
          onClick={this.addDataBlock}>Add data block</Button>

        <div className='space-div'></div>
      </div>
    )
  }
}
