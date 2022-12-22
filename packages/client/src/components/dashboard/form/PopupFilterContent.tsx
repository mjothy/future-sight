import {getSelectedFilter, SelectInput} from '@future-sight/common';
import {Radio, RadioChangeEvent, Space} from 'antd';
import {Component} from 'react';
import FILTERS_DEFINITION from "../../filter/FiltersDefinition";

export default class PopupFilterContent extends Component<any, any> {

  handleCheckedFilter = (e: RadioChangeEvent) => {
    const filter = e.target.value;
    // tHE KEY can be: models/scenarios/regions/variables
    Object.keys(FILTERS_DEFINITION).map((key) => {
      this.props.dataStructure[key].isFilter = filter === key;
    });
    this.props.updateDataStructure(this.props.dataStructure);
  };

  onChange = (filter_id: string, selectedData: string[]) => {
    this.props.dataStructure[filter_id].selection = selectedData;
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

  getRadioList = (selectedFilter) => {
    return Object.values(FILTERS_DEFINITION).map(
        (filter)=>{
          return <div key = {"radio_"+filter.id} className="mt-20">
            <Radio value={filter.id}>
              {filter.icon}
              {filter.label}
            </Radio>
            {selectedFilter === filter.id && this.selectInput(filter.id)}
          </div>
        }
    )
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
            {this.getRadioList(selectedFilter)}
          </Space>
        </Radio.Group>
      </div>
    );
  }
}
