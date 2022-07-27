import React, { Component } from 'react'
import { Button, Col, Divider, Row, Select } from 'antd';
import AnalysisDataTable from './AnalysisDataTable';
import DataManager from '../../../services/DataManager';

class DataStructureForm extends Component<any, any> {
  data = {};
  scenarioSelectRef = React.createRef();

  constructor(props) {
    super(props)
    this.modelSelectionChange = this.modelSelectionChange.bind(this);
    this.scenariosSelectionChange = this.scenariosSelectionChange.bind(this);
    this.state = {
      scenarios: [],
      models: [],

      /**
      * The data selected in dropdownn list
      */
      selectedModel: {},
      selectedScenarios: [],

      /**
      * The data showed in table
      */
      scenariosInTable: []
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
  modelSelectionChange(modelSelected: string) {
    const selectedModel = this.state.models.filter(model => model.name === modelSelected)[0];
    // Change scenarios on dropdown list
    let scenarios: any[] = [];
    scenarios = [...selectedModel.scenarios]
    this.setState({ scenarios, selectedModel: selectedModel, selectedScenarios: [] });
  }

  scenariosSelectionChange(scenarioSelectes: string[]) {
    const selectedScenarios = this.state.selectedModel.scenarios.filter(scenario => scenarioSelectes.indexOf(scenario.name) >= 0).map(scenario => scenario)
    this.setState({ selectedScenarios })
  }

  /**
   * To show the selected data in table
   */
  addDataToTable = () => {
    if (this.state.selectedModel.id != null) {

      // Check if the model selected already in table, if TRUE
      // update the existing data
      const modelExist = this.isModelExist();
      let models = [...this.props.models];
      if (modelExist.length > 0) {
        models.map(model => {
          if (model.name === this.state.selectedModel.name) {
            model.scenarios = this.state.selectedScenarios
          }
        })
      } else {
        const model = { ...this.state.selectedModel };
        model.scenarios = this.state.selectedScenarios;
        models = [model, ...models];
      }

      // Find variables and regions

      const variables = this.getVariables(models);
      console.log("variables: ", variables);

      this.props.handleStructureData(models, variables);
      // this.props.handleVariables(variables);
      this.resetForm();
    }
  }

  /**
   * Check if the selected model is already existing in table
   * @returns {boolean}
   */
  isModelExist = () => {
    return this.props.models.filter(model => model.name === this.state.selectedModel.name);
  }

  getVariables = (models) => {

    const variables:any[] = [];
    models.map(model => {
      model.scenarios.map(scenario => {
        const data = {
          model: model.name,
          scenario: scenario.name
        }
        console.log("data: ", data);
        this.props.dataManager.fetchVariables(data).then(res => {
          console.log("res: ", res);
          // variables = [...variables , res]
          variables.push({...res})
        }
          );
      });
    });
    return variables;
  }

  /**
   * Reset the drop down lists
   */
  resetForm = () => {
    this.setState({
      selectedScenarios: [],
      selectedModel: {},
      scenarios: []
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
              value={this.state.selectedModel.name}
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
              value={this.state.selectedScenarios.map(e => e.name)}
              onChange={this.scenariosSelectionChange}
              options={this.state.scenarios}
              fieldNames={{
                value: "name",
                label: "name",
              }}
            />
          </Col>
          <Divider />

        </Row>
        <Row justify='center'>
          <Button type='primary' onClick={this.addDataToTable}>Add as analysis data </Button>
        </Row>
        <Divider />

        <Row justify='center'>
          <AnalysisDataTable models={this.props.models} />
        </Row>
      </div>
    )

  }
}

export default DataManager(DataStructureForm);
