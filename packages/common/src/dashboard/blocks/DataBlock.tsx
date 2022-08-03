import { Component } from 'react'
import { Button, Divider, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import PlotTypes from '../graphs/PlotTypes';

export default class DataBlock extends Component<any, any> {

  constructor(props) {
    super(props);
    this.binding();
    this.state = {
      scenarios: [],
      selectedModels: [],
      selectedScenarios: [],
      selectedVariables: [],
      selectedRegions: [],

      variables: [],
      regions: [],

      data: [],

      click: 0,

      plotType: "line",

      visualizationData: []
    }
  }

  binding() {
    this.modelSelectionChange = this.modelSelectionChange.bind(this);
    this.scenariosSelectionChange = this.scenariosSelectionChange.bind(this);
    this.variablesSelectionChange = this.variablesSelectionChange.bind(this);
    this.plotTypeOnChange = this.plotTypeOnChange.bind(this);
  }

  /**
   * Trigged when the list of selection models changed
   * to update the list of scenarios
   * @param selectedModels Array of names of all selected models
   */
  modelSelectionChange(selectedModels: string[]) {
    this.setState({ selectedModels }, () => {
      this.setVariablesRegions();
    });

  }

  /**
   * 
   * @param selectedScenarios 
   */
  scenariosSelectionChange(selectedScenarios: string[]) {
    this.setState({ selectedScenarios }, () => {
      this.setVariablesRegions();
    })

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

  plotTypeOnChange(plotType: string) {
    this.setState({ plotType })
  }

  addDataBlock = () => {
    // Add datablock
    // fetch data by model, scenario, variables and regions selected
    this.props.dataManager.fetchData().then(data => this.setState({ data }, () => {
      // Add changes directly to Database (json file)
      const layout = [{
        w: 4,
        h: 2,
        x: 0,
        y: 0,
        i: "graph" + this.state.click
      }];
      const layouts = {
        lg: layout,
        md: layout,
        sm: layout,
        xs: layout,
        xxs: layout,
      };
      // Change on database
      const key = "graph" + this.state.click;
      const data1 = {}
      data[0].type = this.state.plotType;
      data1[key] = data[0]
      // Send the props to Dashboard.tsx (Thant inject the data and layout to DashboardConfigView)
      this.props.buildLayouts(layouts, data1);
      this.setState({ click: this.state.click + 1 });

    }))
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
          onChange={this.modelSelectionChange}
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
          onChange={this.scenariosSelectionChange}
        >
          {
            this.state.selectedModels.map((model) => {
              return Object.keys(structureData[model]).map(scenarioKey =>
                <Select.Option key={scenarioKey} value={scenarioKey}>{scenarioKey}</Select.Option>
              )
            }
            )
          }
        </Select>
        <Divider />
        <Select
          mode="multiple"
          className="width-100"
          placeholder="Variables"
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
        <Select
          className="width-100"
          placeholder="Graph type"
          defaultValue={this.state.plotType}
          options={PlotTypes}
          onChange={this.plotTypeOnChange}
          fieldNames={{
            value: "type",
            label: "type",
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
