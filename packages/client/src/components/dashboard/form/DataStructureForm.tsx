import React, { Component } from 'react';
import { Button, Col, Divider, Row, Select } from 'antd';
import AnalysisDataTable from './AnalysisDataTable';
import { Option } from 'antd/lib/mentions';

/**
 * Make the user selected all metaData of models and scenarios
 */
class DataStructureForm extends Component<any, any> {
  data = {};
  scenarioSelectRef = React.createRef();

  constructor(props) {
    super(props);
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
      data: [],
    };
  }

  componentDidMount() {
    this.props.dataManager.fetchModels().then((data) => {
      this.setState({ models: data });
    });

    this.setState({ data: { ...this.props.dashboard.dataStructure } })
  }

  /**
   * Triggered when the list of selection models changed
   * to update the list of scenarios
   */
  modelSelectionChange = (modelSelected: string) => {
    const data = {};
    data[modelSelected] = {};
    // Change scenarios on dropdown list
    let scenarios: any[] = [];
    scenarios = Object.keys(this.state.models[modelSelected]);
    this.setState({
      scenarios,
      selectedModel: modelSelected,
      selectedScenarios: [],
      data: { ...this.state.data, ...data },
    });
  };

  scenariosSelectionChange = (selectedScenarios: string[]) => {
    this.setState({ selectedScenarios });
  };

  /**
   * To show the selected data in table
   */
  addDataToTable = () => {
    if (
      this.state.selectedModel != '' &&
      this.state.selectedScenarios.length > 0
    ) {
      const data = this.state.data;
      const model = this.state.selectedModel;
      this.state.selectedScenarios.map((scenario) => {
        // to set variables and regions
        data[model][scenario] = this.state.models[model][scenario];
      });
      this.props.handleStructureData(data);
      this.resetForm();
    }
  };

  /**
   * Reset the drop down lists
   */
  resetForm = () => {
    this.setState({
      selectedScenarios: [],
      selectedModel: null,
      scenarios: [],
    });
  };

  render() {
    return (
      <div>
        <Row justify="space-evenly">
          <Col xs={20} sm={20} md={6} lg={7}>
            <Select
              className="width-100"
              placeholder="Please select the model"
              value={this.state.selectedModel}
              onChange={this.modelSelectionChange}
            >
              {
                Object.keys(this.state.models).map(model =>
                  <Option key={model} value={model}>
                    {model}
                  </Option>)}
            </Select>
          </Col>

          <Col xs={20} sm={20} md={6} lg={7}>
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Scenarios"
              onChange={this.scenariosSelectionChange}
              value={this.state.selectedScenarios}
            >
              {this.state.scenarios.map((scenario) => (
                <Option key={scenario} value={scenario}>
                  {scenario}
                </Option>
              ))}
            </Select>
          </Col>
          <Divider />
        </Row>
        <Row justify="center">
          <Button type="primary" onClick={this.addDataToTable}>
            Add as analysis data
          </Button>
        </Row>
        <Divider />

        <Row justify="center">
          <AnalysisDataTable dataStructure={this.props.dashboard.dataStructure} />
        </Row>
      </div>
    );
  }
}

export default DataStructureForm;
