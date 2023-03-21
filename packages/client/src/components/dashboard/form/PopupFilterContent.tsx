import {
  BranchesOutlined,
  ControlOutlined,
  GlobalOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { getSelectedFiltersLabels, SelectInput } from '@future-sight/common';
import { Checkbox, Space } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { Component } from 'react';

export default class PopupFilterContent extends Component<any, any> {

  handleCheckedFilter = (selectedFilters: CheckboxValueType[]) => {
    const dataStructure = JSON.parse(JSON.stringify(this.props.dataStructure));
    // tHE KEY can be: models/scenarios/regions/variables
    this.props.optionsLabel.forEach((key) => {
      if (selectedFilters.includes(key)) {
        dataStructure[key].isFilter = true;
      } else {
        dataStructure[key].isFilter = false;
        dataStructure[key].selection = [];
      }
    });
    this.props.updateDataStructure(dataStructure);
  };

  onChange = (type: string, selectedData: string[]) => {
    const dataStructure = JSON.parse(JSON.stringify(this.props.dataStructure));
    dataStructure[type].selection = selectedData;
    this.props.updateDataStructure(dataStructure, type); // Type for UPDATE needToFetch

  }

  onDropdownVisibleChange = (type: string, e: any) => {
    if (e)
      this.props.updateOptionsData(type); // if input oppened fetch (if using onFocus, we need to delete the focus after input closed)

  }
  selectInput = (type) => {
    return <SelectInput
      type={type}
      value={this.props.dataStructure[type].selection}
      options={this.props.optionsData[type]}
      onChange={this.onChange}
      isFetch={this.props.isFetch}
      onDropdownVisibleChange={this.onDropdownVisibleChange}
    />
  }

  render() {
    const selectedFilter = getSelectedFiltersLabels(this.props.dataStructure);
    return (
      <div>
        <Checkbox.Group
          onChange={this.handleCheckedFilter}
          className="width-100"
          value={selectedFilter}
        >
          <Space direction="vertical" className="width-100">
            <div className="mt-20">
              <Checkbox value={'regions'}>
                <GlobalOutlined />
                Regions
              </Checkbox>
              {selectedFilter.includes('regions') && this.selectInput('regions')}
            </div>

            <div className="mt-20">
              <Checkbox value={'variables'}>
                <LineChartOutlined />
                Variables
              </Checkbox>
              {selectedFilter.includes('variables') && this.selectInput('variables')}
            </div>
            <div className="mt-20">
              <Checkbox value={'scenarios'}>
                <BranchesOutlined />
                Scenarios
              </Checkbox>
              {selectedFilter.includes('scenarios') && this.selectInput('scenarios')}
            </div>
            <div className="mt-20">
              <Checkbox value={'models'}>
                <ControlOutlined />
                Models
              </Checkbox>
              {selectedFilter.includes('models') && this.selectInput('models')}
            </div>
          </Space>
        </Checkbox.Group>
      </div>
    );
  }
}
