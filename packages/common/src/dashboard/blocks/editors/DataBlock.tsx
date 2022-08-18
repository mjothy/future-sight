import { Component } from 'react'
import { Divider, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import DataBlockTableSelection from './DataBlockTableSelection';

export default class DataBlock extends Component<any, any> {

  variables: string[] = [];
  regions: string[] = [];
  defaultVariables: string[] = [];
  defaultRegions: string[] = [];

  constructor(props) {
    super(props);
    this.updateDropdownData();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.blockSelectedId !== this.props.blockSelectedId) {
      this.updateDropdownData();
    }
  }

  /**
   * Update the options of dropdown lists of variables and regions
   * SHOW only the options when we can find data to visualize
   */
  updateDropdownData = () => {
    const selectedData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    const models = selectedData.models;
    const dataStructure = this.props.dashboard.dataStructure;
    this.variables = [];
    this.regions = [];
    Object.keys(models).map((modelKey) => {
      models[modelKey].map(scenarioKey => {
        this.variables = [...this.variables, ...dataStructure[modelKey][scenarioKey].variables];
        this.regions = [...this.regions, ...dataStructure[modelKey][scenarioKey].regions];
      })
    });

    // Show unique values
    this.variables = [...new Set(this.variables)];
    this.regions = [...new Set(this.regions)];

    // Show selected/default values (check if the selected values in the dropdown list options)
    this.defaultVariables = selectedData.variables.filter((variable: string) => this.variables.indexOf(variable) >= 0).map(variable => variable);
    this.defaultRegions = selectedData.regions.filter((region: string) => this.regions.indexOf(region) >= 0).map(region => region);

    this.props.updateBlockMetaData({ variables: this.defaultVariables, regions: this.defaultRegions });
  }

  variablesSelectionChange = (selectedVariables: string[]) => {
    this.props.updateBlockMetaData({ variables: selectedVariables });

  }

  regionsSelectionChange = (selectedRegions: string[]) => {
    this.props.updateBlockMetaData({ regions: selectedRegions });
  }

  render() {

    return (
      <div className='width-100'>
        <Divider />
        <DataBlockTableSelection  {...this.props} updateDropdownData={this.updateDropdownData} />
        <Divider />
        {/* adding key, because react not updating the default value on state change */}
        <div>
          <Select key={this.defaultVariables.toString()}
            mode="multiple"
            className="width-100"
            placeholder="Variables"
            defaultValue={this.defaultVariables}
            onChange={this.variablesSelectionChange}
          >
            {this.defaultVariables}
            {
              this.variables.map(variable =>
                <Option key={variable} value={variable}>{variable}</Option>
              )}
          </Select>
        </div>
        <Divider />
        <div>
          <Select key={this.defaultRegions.toString()}
            mode="multiple"
            className="width-100"
            placeholder="Regions"
            defaultValue={this.defaultRegions}
            onChange={this.regionsSelectionChange}
          >
            {
              this.regions.map(region =>
                <Option key={region} value={region}>{region}</Option>
              )}
          </Select>
        </div>
          <div className='space-div'></div>
      </div>
    )
  }
}