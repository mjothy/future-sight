import {
  BranchesOutlined,
  ControlOutlined,
  GlobalOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { getSelectedFilter } from '@future-sight/common';
import { Radio, RadioChangeEvent, Select, Space } from 'antd';
import { Option } from 'antd/lib/mentions';
import { Component } from 'react';

export default class PopupFilterContent extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      options: Object.keys(this.props.filters)
    }
  }

  onRegionsChange = (regions: string[]) => {
    this.props.dataStructure.regions.selection = regions;
    this.props.updateDataStructure(this.props.dataStructure);
  };

  onVariablesChange = (variables: string[]) => {
    this.props.dataStructure.variables.selection = variables;
    this.props.updateDataStructure(this.props.dataStructure);
  };

  onScenariosChange = (scenarios: string[]) => {
    this.props.dataStructure.scenarios.selection = scenarios;
    this.props.updateDataStructure(this.props.dataStructure);
  };

  onModelsChange = (models: string[]) => {
    this.props.dataStructure.models.selection = models;
    this.props.updateDataStructure(this.props.dataStructure);
  };

  onChange = (e: RadioChangeEvent) => {
    const filter = e.target.value;
    // tHE KEY can be: models/scenarios/regions/variables
    Object.keys(this.props.dataStructure).map((key) => {
      if (filter === key) {
        this.props.dataStructure[key].isFilter = true;
      } else {
        this.props.dataStructure[key].isFilter = false;
        // this.props.dataStructure[key].selection = [];
      }
    });
    this.props.updateDataStructure(this.props.dataStructure);
    this.props.updateSelectedFilter(filter);
  };

  render() {
    const selectedFilter = getSelectedFilter(this.props.dashboard);
    return (
      <div>
        <Radio.Group
          onChange={this.onChange}
          className="width-100"
          value={selectedFilter}
        >
          <Space direction="vertical" className="width-100">
            <div className="mt-20">
              <Radio value={'regions'}>
                <GlobalOutlined />
                Regions
              </Radio>
              {selectedFilter === 'regions' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Regions"
                  value={this.props.dataStructure.regions.selection}
                  onChange={this.onRegionsChange}
                >
                  {Object.keys(this.props.filters.regions).map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>

            <div className="mt-20">
              <Radio value={'variables'}>
                <LineChartOutlined />
                Variables
              </Radio>
              {selectedFilter === 'variables' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Variables"
                  value={this.props.dataStructure.variables.selection}
                  onChange={this.onVariablesChange}
                >
                  {Object.keys(this.props.filters.variables).map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="mt-20">
              <Radio value={'scenarios'}>
                <BranchesOutlined />
                Scenarios
              </Radio>
              {selectedFilter === 'scenarios' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Scenarios"
                  value={this.props.dataStructure.scenarios.selection}
                  onChange={this.onScenariosChange}
                >
                  {Object.keys(this.props.filters.scenarios).map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="mt-20">
              <Radio value={'models'}>
                <ControlOutlined />
                Models
              </Radio>
              {selectedFilter === 'models' && (
                <Select
                  mode="multiple"
                  className="width-100 mt-20"
                  placeholder="Models"
                  value={this.props.dataStructure.models.selection}
                  onChange={this.onModelsChange}
                >
                  {Object.keys(this.props.filters.models).map((option) => (
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
