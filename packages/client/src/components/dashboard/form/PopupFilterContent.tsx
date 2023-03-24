import {
  BranchesOutlined,
  ControlOutlined,
  ExclamationCircleOutlined,
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
    this.props.updateDataStructure(dataStructure);

  }

  onDropdownVisibleChange = (type: string, e: any) => {
    const isClosed = !e; // on input close, fetch options in other selected inputs (to track missing data)
    if (isClosed) {
      this.props.updateOptionsData(type);
    }
  }

  selectInput = (type) => {
    return <SelectInput
      type={type}
      value={this.props.dataStructure[type].selection}
      options={this.props.optionsData[type]}
      onChange={this.onChange}
      isFetching={this.props.isFetching}
      onDropdownVisibleChange={this.onDropdownVisibleChange}
    />
  }

  isDataMissing = (type: string) => {
    const dataStructureData = this.props.dataStructure[type].selection;
    const optionsData = this.props.optionsData[type];

    const selected_in_options = dataStructureData.filter(value => optionsData.includes(value));
    return !(selected_in_options.length == dataStructureData.length)
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
                Variables&nbsp;<label className='no-data'> {this.isDataMissing("variables") ? <><ExclamationCircleOutlined /> Data missing</> : ''}</label>
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
                Models&nbsp;<label className='no-data'> {this.isDataMissing("models") ? <><ExclamationCircleOutlined /> Data missing</> : ''}</label>
              </Checkbox>
              {selectedFilter.includes('models') && this.selectInput('models')}
            </div>
          </Space>
        </Checkbox.Group>
      </div>
    );
  }
}
