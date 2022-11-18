import {
  BranchesOutlined,
  ControlOutlined,
  GlobalOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { getSelectedFilter, SelectInput } from '@future-sight/common';
import { Radio, RadioChangeEvent, Space } from 'antd';
import { Component } from 'react';

export default class PopupFilterContent extends Component<any, any> {

  handleCheckedFilter = (e: RadioChangeEvent) => {
    const filter = e.target.value;
    // tHE KEY can be: models/scenarios/regions/variables
    this.props.options.map((key) => {
      if (filter === key) {
        this.props.dataStructure[key].isFilter = true;
      } else {
        this.props.dataStructure[key].isFilter = false;
      }
    });
    this.props.updateDataStructure(this.props.dataStructure);
  };

  onChange = (type: string, selectedData: string[]) => {
    this.props.dataStructure[type].selection = selectedData;
    this.props.updateDataStructure(this.props.dataStructure);
  }

  selectInput = (type) => {
    return <SelectInput
      type={type}
      value={this.props.dataStructure[type].selection}
      options={Object.keys(this.props.filters[type])}
      onChange={this.onChange}
    />
  }

  render() {
    const selectedFilter = getSelectedFilter(this.props.dataStructure);
    return (
      <div>
        <Radio.Group
          onChange={this.handleCheckedFilter}
          className="width-100"
          value={selectedFilter}
        >
          <Space direction="vertical" className="width-100">
            <div className="mt-20">
              <Radio value={'regions'}>
                <GlobalOutlined />
                Regions
              </Radio>
              {selectedFilter === 'regions' && this.selectInput('regions')}
            </div>

            <div className="mt-20">
              <Radio value={'variables'}>
                <LineChartOutlined />
                Variables
              </Radio>
              {selectedFilter === 'variables' && this.selectInput('variables')}
            </div>
            <div className="mt-20">
              <Radio value={'scenarios'}>
                <BranchesOutlined />
                Scenarios
              </Radio>
              {selectedFilter === 'scenarios' && this.selectInput('scenarios')}
            </div>
            <div className="mt-20">
              <Radio value={'models'}>
                <ControlOutlined />
                Models
              </Radio>
              {selectedFilter === 'models' && this.selectInput('models')}
            </div>
          </Space>
        </Radio.Group>
      </div>
    );
  }
}
