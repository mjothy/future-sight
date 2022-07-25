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
      modelsInTable: [],
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
    scenarios = [...scenarios, ...selectedModel.scenarios]
    this.setState({ scenarios, selectedModel: selectedModel});
  }

  scenariosSelectionChange(scenarioSelectes: string[]){
    const selectedScenarios = this.state.selectedModel.scenarios.filter(scenario => scenarioSelectes.indexOf(scenario.name) >=0).map(scenario => scenario)
    console.log("scenarios: ", selectedScenarios)
    this.setState({selectedScenarios})
  }

  /**
   * To show the selected data in table
   */
  addDataToTable = () => {

    const model = this.state.selectedModel;
    model.scenarios = this.state.selectedScenarios
    const state = {
      modelsInTable: [model, ...this.state.modelsInTable],
      scenariosInTable: [...this.state.scenarios, ...this.state.scenariosInTable]
    }

    this.setState(state, () => {
      this.resetForm();
    })
  }
  
  /**
   * Reset the drop down lists
   */
  resetForm = () => {
    this.setState({
      selectedScenarios: [],
      selectedModel: {},
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
          <AnalysisDataTable models={this.state.modelsInTable} scenarios={this.state.scenariosInTable} />
        </Row>
      </div>
    )

  }
}

export default DataManager(DataStructureForm);
