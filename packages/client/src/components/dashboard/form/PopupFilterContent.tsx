import {
  BranchesOutlined,
  ControlOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  LineChartOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { getSelectedFiltersLabels, SelectInput } from '@future-sight/common';
import { Checkbox, Space } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { Component } from 'react';

export default class PopupFilterContent extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      dataStructure: JSON.parse(JSON.stringify(this.props.dataStructure))
    }
  }
  handleCheckedFilter = (newSelectedFilters: CheckboxValueType[]) => {
    const dataStructure = JSON.parse(JSON.stringify(this.state.dataStructure));
    const oldSelectedFilters = Object.keys(dataStructure).filter(key => dataStructure[key].isFilter);
    // tHE KEY can be: models/scenarios/regions/variables
    Object.keys(dataStructure).forEach((key) => {
      if (newSelectedFilters.includes(key)) {
        dataStructure[key].isFilter = true;
      } else {
        dataStructure[key].isFilter = false;
        dataStructure[key].selection = [];
      }
    });
    this.setState({ dataStructure });

    const filtersToUpdate = newSelectedFilters.filter((filter: CheckboxValueType) => !oldSelectedFilters.includes(filter as string));
    const filterToUpdate = filtersToUpdate?.length > 0 ? filtersToUpdate[0] : null;

    if (filterToUpdate != null) {
      const filtersToNotUpdate = newSelectedFilters.filter((filter: CheckboxValueType) => oldSelectedFilters.includes(filter as string));
      this.props.updateDataStructure(dataStructure, filtersToNotUpdate);
    } else {
      this.props.updateDataStructure(dataStructure);
    }

  };

  onChange = (type: string, selectedData: string[]) => {
    const dataStructure = JSON.parse(JSON.stringify(this.state.dataStructure));
    dataStructure[type].selection = selectedData;
    this.setState({ dataStructure });
  }

  onDropdownVisibleChange = (filter: string, e: any) => {
    const isClosed = !e; // on input close, fetch options in other selected inputs (to track missing data)
    if (isClosed) {
      this.props.updateDataStructure(this.state.dataStructure, [filter]);
    }
  }

  selectInput = (type) => {
    return <SelectInput
      type={type}
      className={"width-90"}
      loading={this.props.isFetching}
      value={this.state.dataStructure[type].selection}
      options={this.props.optionsData[type]}
      onChange={this.onChange}
      isFetching={this.props.isFetching}
      onDropdownVisibleChange={this.onDropdownVisibleChange}
      isClosable={true}
    />
  }

  render() {
    const selectedFilter = getSelectedFiltersLabels(this.state.dataStructure);
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
                Variables&nbsp;<label className='no-data'> {this.props.isDataMissing("variables") ? <><ExclamationCircleOutlined /> Data missing</> : ''}</label>
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
                Models&nbsp;<label className='no-data'> {this.props.isDataMissing("models") ? <><ExclamationCircleOutlined /> Data missing</> : ''}</label>
              </Checkbox>
              {selectedFilter.includes('models') && this.selectInput('models')}
            </div>
            <div className="mt-20">
              <Checkbox value={'categories'}>
                <TagOutlined />
                Categories(optional)&nbsp;
                {/* TODO uncomment  */}
                {/* <label className='no-data'> {this.props.isDataMissing("categories") ? <><ExclamationCircleOutlined /> Data missing</> : ''}</label> */}
              </Checkbox>
              {selectedFilter.includes('categories') && this.selectInput('categories')}
            </div>
          </Space>
        </Checkbox.Group>
      </div>
    );
  }
}
