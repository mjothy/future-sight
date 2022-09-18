import { Alert, Radio, RadioChangeEvent, Select, Space } from 'antd';
import { Option } from 'antd/lib/mentions';
import React, { Component } from 'react';

export default class PopupFilterContent extends Component<any, any> {
  regions: string[] = [];
  variables: string[] = [];
  scenarios: string[] = [];
  models: string[] = [];

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // fetching data
    this.props.dataManager
      .fetchRegions()
      .then((regions) => (this.regions = regions));
    this.props.dataManager
      .fetchVariables()
      .then((variables) => (this.variables = variables));
    this.props.dataManager
      .fetchScenarios()
      .then((scenarios) => (this.scenarios = scenarios));
    this.props.dataManager
      .fetchModels()
      .then((models) => (this.models = models));
  }

  render() {
    const dataStructure = this.props.dataStructure;

    const onRegionsChange = (regions: string[]) => {
      dataStructure.regions.selection = regions;
      this.props.updateDataStructure(dataStructure);
    };

    const onVariablesChange = (variables: string[]) => {
      dataStructure.variables.selection = variables;
      this.props.updateDataStructure(dataStructure);
    };

    const onScenariosChange = (scenarios: string[]) => {
      dataStructure.scenarios.selection = scenarios;
      this.props.updateDataStructure(dataStructure);
    };

    const onModelsChange = (models: string[]) => {
      dataStructure.models.selection = models;
      this.props.updateDataStructure(dataStructure);
    };

    const onChange = (e: RadioChangeEvent) => {
      const filter = e.target.value;
      // tHE KEY can be: models/scenarios/regions/variables
      Object.keys(dataStructure).map((key) => {
        if (filter === key) {
          dataStructure[key].isFilter = true;
        } else {
          dataStructure[key].isFilter = false;
          dataStructure[key].selection = [];
        }
      });
      this.props.updateDataStructure(dataStructure);
      this.props.updateSelectedFilter(filter);
    };

    const isChange = () => {
      const filter = Object.keys(this.props.dashboard.dataStructure)
        .filter((e) => this.props.dashboard.dataStructure[e].isFilter)
        .map((e) => this.props.dashboard.dataStructure[e])[0];
      const newFilter = Object.keys(dataStructure)
        .filter((e) => dataStructure[e].isFilter)
        .map((e) => dataStructure[e])[0];

      if (JSON.stringify(filter) === JSON.stringify(newFilter)) {
        return false;
      } else {
        return true;
      }
    };

    return (
      <div>
        {isChange() && (
          <Alert
            message="Warning"
            description="Changes have been done."
            type="warning"
            className="width-100"
            showIcon
            closable
          />
        )}
        <Radio.Group
          onChange={onChange}
          className="width-100"
          value={this.props.selectedFilter}
        >
          <Space direction="vertical" className="width-100">
            <div className="mt-20">
              <Radio value={'regions'}>Regions</Radio>
              {this.props.selectedFilter === 'regions' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Regions"
                  value={dataStructure.regions.selection}
                  onChange={onRegionsChange}
                >
                  {this.regions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>

            <div className="mt-20">
              <Radio value={'variables'}>Variables</Radio>
              {this.props.selectedFilter === 'variables' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Variables"
                  value={dataStructure.variables.selection}
                  onChange={onVariablesChange}
                >
                  {this.variables.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="mt-20">
              <Radio value={'scenarios'}>Scenarios</Radio>
              {this.props.selectedFilter === 'scenarios' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Scenarios"
                  value={dataStructure.scenarios.selection}
                  onChange={onScenariosChange}
                >
                  {this.scenarios.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="mt-20">
              <Radio value={'models'}>Models</Radio>
              {this.props.selectedFilter === 'models' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Models"
                  value={dataStructure.models.selection}
                  onChange={onModelsChange}
                >
                  {this.models.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          </Space>
        </Radio.Group>
      </div>
    );
  }
}
