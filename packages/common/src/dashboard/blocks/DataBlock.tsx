import { Component } from 'react'
import { Button, Divider, Select } from 'antd';
import { Option } from 'antd/lib/mentions';

export default class DataBlock extends Component<any, any> {

  constructor(props) {
    super(props);
    this.modelSelectionChange = this.modelSelectionChange.bind(this);
    this.scenariosSelectionChange = this.scenariosSelectionChange.bind(this);
    this.variablesSelectionChange = this.variablesSelectionChange.bind(this);

    this.state = {
      scenarios: [],
      selectedModels: [],
      selectedScenarios: [],
      selectedVariable: [],
      selectedRegions: [],

      variables: [],
      regions: [],

      data: [],

      click: 0

    }
  }

  /**
   * Trigged when the list of selection models changed
   * to update the list of scenarios
   * @param selectedModelsString Array of names of all selected models
   */
  modelSelectionChange(selectedModelsString: string[]) {
    // map into the string array, find the model, fetch scenario and add it to 
    const selectedModels: any[] = [];
    const scenarios: any = [];

    selectedModelsString.map(model => {
      const modelExist = this.getModel(model);
      if (modelExist) selectedModels.push(modelExist);
    })

    selectedModels.map(e => scenarios.push(...e.scenarios))
    this.setState({ selectedModels, scenarios });
  }

  getModel(model: string) {
    const selectedModel = this.props.structureData.models.filter(modelElement => modelElement.name === model)[0];
    return selectedModel;
  }

  /**
   * 
   * @param selectedScenariosString 
   */
  scenariosSelectionChange(selectedScenariosString: string[]) {
    // get variables of the selected scenarios
    // change it after to filter by {model, scenario}
    const selectedScenarios: any[] = [];
    this.state.selectedModels.map(model => {

      model.scenarios.map(scenario => {
        if (selectedScenariosString.includes(scenario.name)) {
          selectedScenarios.push(scenario);
          this.setVariables(model, scenario);
        }
        this.setState({ selectedScenarios });
      });
    });

  }

  setVariables = (model, scenario) => {
    this.props.dataManager.fetchVariables({
      model: model.name,
      scenario: scenario.name
    }).then(data => {
      const vars = data.variables.filter(e => {
        if (!this.state.variables.includes(e.name)) return e;
      }).map(e => e.name);
      this.setState({ variables: [...this.state.variables, ...vars] })
    });
  }

  variablesSelectionChange(variables: string[]) {
    // get Region by {model, scenario, variable}
    this.state.selectedModels.map(model => {
      this.state.selectedScenarios.map(scenario => {
        variables.map(variable => {
          this.props.dataManager.fetchRegions({
            model: model.name,
            scenario: scenario.name,
            variable: variable
          }).then(fetchRegions => {
            fetchRegions.map(r => {
              if (!this.state.regions.includes(r.name))
                this.state.regions.push(r.name);
            })
            this.setState({ regions: this.state.regions })
          });
        })
      })
    })
  }

  addDataBlock = () => {
    // Add datablock
    // fetch data by model, scenario, variables and regions selected
    this.props.dataManager.fetchData().then(data => this.setState({ data }, () => {
      // Add changes directly to Database (json file)
      const layout = {
        w: 4,
        h: 2,
        x: this.state.click,
        y: 0,
        i: "graph" + this.state.click
      };
      // Change on database
      const key = "graph" + this.state.click;
      const data1 = {}
      data1[key] = data[0]
      // Send the props to Dashboard.tsx (Thant inject the data and layout to DashboardConfigView)
      this.props.buildLayouts(layout, data1);
      this.setState({ click: this.state.click + 1 });

    }))
  }

  render() {
    return (
      <div className='width-100'>
        <Divider />
        <Select
          mode="multiple"
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
          mode="multiple"
          className="width-100"
          placeholder="Scenario"
          options={this.state.scenarios}
          onChange={this.scenariosSelectionChange}
          fieldNames={{
            value: "name",
            label: "name",
          }}
        />
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Variable"
          onChange={this.variablesSelectionChange}
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
        >
          {this.state.regions.map(region =>
            <Option key={region} value={region}>{region}</Option>
          )}
        </Select>
        <Divider />
        <Button type='primary' className='width-100'
          onClick={this.addDataBlock}>Add data block</Button>

        <div className='space-div'></div>
      </div>
    )
  }
}
