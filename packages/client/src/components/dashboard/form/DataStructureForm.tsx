import React, { Component } from 'react'
import { Button, Col, Divider, Row, Select } from 'antd';
import AnalysisDataTable from './AnalysisDataTable';
import { Option } from 'antd/lib/mentions';

class DataStructureForm extends Component<any, any> {
  data = {};
  scenarioSelectRef = React.createRef();

  constructor(props) {
    super(props)
    this.state = {
      scenarios: [],
      models: [],

      /**
      * The data selected in dropdownn list
      */
      selectedModel: null,
      selectedScenarios: [],

      /**
       * The data to send to dashboard
       */
      data: []
    }
  }

  componentDidMount() {
    this.props.dataManager.fetchModels().then((data) => {
      this.setState({ models: data })
    });
  }

  /**
   * Trigged when the list of selection models changed
   * to update the list of scenarios
   */
  modelSelectionChange = (modelSelected: string) => {
    const selectedModel = this.state.models.filter(model => model.name === modelSelected)[0];
    const data = {}
    data[modelSelected] = {}
    // Change scenarios on dropdown list
    let scenarios: any[] = [];
    scenarios = [...selectedModel.scenarios]
    this.setState({ scenarios, selectedModel: selectedModel.name, selectedScenarios: [], data: { ...this.state.data, ...data } });
  }

  scenariosSelectionChange = (selectedScenarios: string[]) => {
    this.setState({ selectedScenarios })
  }

  /**
   * To show the selected data in table
   */
  addDataToTable = () => {
    if (this.state.selectedModel != "" && this.state.selectedScenarios.length > 0) {
      const data = this.state.data;
      const model = this.state.selectedModel;
      this.state.selectedScenarios.map(scenario => {
        data[model][scenario] = {
          regions: [],
          variables: []
        }
        // get variables, and regions
        this.getVariables(model, scenario).then(res => data[model][scenario].variables = res);
        this.getRegions(model, scenario).then(res => data[model][scenario].regions = res);
      })
      this.props.handleStructureData(data);
      this.resetForm();
    }
  }

  /**
   * To fetch the variables of {model, scenario}
   * @param model model name
   * @param scenario scenario name
   * @returns array of strings of variables name
   */
  async getVariables(model, scenario) {
    const dataManager = this.props.dataManager;
    const data = {
      model, scenario
    }
    return await dataManager.fetchVariables(data).then(variablesData => { if (variablesData != null) return variablesData.variables.map(v => v.name) });
  }

  /**
   * To fetch the regions of {model, scenario}
   * @param model model name
   * @param scenario scenario name
   * @returns array of strings of regions name
   */
  async getRegions(model, scenario) {
    const dataManager = this.props.dataManager;
    const data = {
      model, scenario
    }
    return await dataManager.fetchRegions(data).then(regionsData => regionsData.map(r => r.name));
  }

  /**
   * Reset the drop down lists
   */
  resetForm = () => {
    this.setState({
      selectedScenarios: [],
      selectedModel: null,
      scenarios: [],
    })
  }

  render() {
    return (
      <div>
        <Row justify="space-evenly">
          <Col xs={20} sm={20} md={6} lg={7} >
            <Select
              className="width-100"
              placeholder="Please select the model"
              value={this.state.selectedModel}
              onChange={this.modelSelectionChange}
              options={this.state.models}
              fieldNames={{
                value: "name",
                label: "name",
              }}
            />
          </Col>

          <Col xs={20} sm={20} md={6} lg={7} >
            <Select
              mode="multiple"
              className='width-100'
              placeholder="Scenarios"
              onChange={this.scenariosSelectionChange}
              value={this.state.selectedScenarios}
            >
              {this.state.scenarios.map(scenario =>
                <Option key={scenario.name} value={scenario.name}>{scenario.name}</Option>
              )}
            </Select>
          </Col>
          <Divider />

        </Row>
        <Row justify='center'>
          <Button type='primary' onClick={this.addDataToTable}>Add as analysis data </Button>
        </Row>
        <Divider />

        <Row justify='center'>
          <AnalysisDataTable structureData={this.props.structureData} />
        </Row>
      </div>
    )
  }
}

export default DataStructureForm;
