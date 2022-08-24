import { Component } from 'react';
import { Divider, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import DataBlockTableSelection from './DataBlockTableSelection';
import BlockModel from '../../../models/BlockModel';

export default class DataBlock extends Component<any, any> {
  variables: string[] = [];
  regions: string[] = [];
  defaultVariables: string[] = [];
  defaultRegions: string[] = [];
  isBlockControlled = false;
  controlBlock: BlockModel = new BlockModel();

  constructor(props) {
    super(props);
    this.updateDropdownData();
    this.checkIfBlockControlled();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const blockSelectedId = this.props.blockSelectedId;
    if (prevProps.blockSelectedId !== blockSelectedId) {
      this.updateDropdownData();
      this.checkIfBlockControlled();
    }
  }

  checkIfBlockControlled = () => {
    const blockSelectedId = this.props.blockSelectedId;
    const controlBlockId = this.props.blocks[blockSelectedId].controlBlock;
    if (controlBlockId !== "") {
      this.isBlockControlled = true;
      this.controlBlock = this.props.blocks[controlBlockId];
    } else {
      this.isBlockControlled = false;
      this.controlBlock = new BlockModel();
    }
  }

  /**
   * Update the options of dropdown lists of variables and regions
   * SHOW only the options when we can find data to visualize
   */
  updateDropdownData = () => {
    console.log("call update")
    const selectedData =
      this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    const models = selectedData.models;
    // All data received from SetUp view
    const dataStructure = this.props.dashboard.dataStructure;
    this.variables = [];
    this.regions = [];
    // To show only variables and regions of selected data
    Object.keys(models).map((modelKey) => {
      models[modelKey].map((scenarioKey) => {
        this.variables = [
          ...this.variables,
          ...dataStructure[modelKey][scenarioKey].variables,
        ];
        this.regions = [
          ...this.regions,
          ...dataStructure[modelKey][scenarioKey].regions,
        ];
      });
    });

    // Show unique values in dropdown list options
    this.variables = [...new Set(this.variables)];
    this.regions = [...new Set(this.regions)];

    // Show selected/default values (check if the selected values exist in the dropdown list options)
    this.defaultVariables = selectedData.variables
      .filter((variable: string) => this.variables.indexOf(variable) >= 0)
      .map((variable) => variable);
    this.defaultRegions = selectedData.regions
      .filter((region: string) => this.regions.indexOf(region) >= 0)
      .map((region) => region);

    this.props.updateBlockMetaData({
      variables: this.defaultVariables,
      regions: this.defaultRegions,
    });
  };


  variablesSelectionChange = (selectedVariables: string[]) => {
    this.props.updateBlockMetaData({ variables: selectedVariables });
    this.updateDropdownData();
  };

  regionsSelectionChange = (selectedRegions: string[]) => {
    this.props.updateBlockMetaData({ regions: selectedRegions });
    this.updateDropdownData();
  };

  render() {

    const currentBlock = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;

    return (

      <div>
        {
          (this.isBlockControlled && this.controlBlock.config.metaData.master.models) ?
            <p>That block is controled by Model/scenario</p>
            :
            <DataBlockTableSelection  {...this.props} updateDropdownData={this.updateDropdownData} />
        }
        <Divider />
        {/* adding key, because react not updating the default value on state change */}
        <div>
          <Select
            key={this.defaultVariables.toString()}
            mode="multiple"
            className="width-100"
            placeholder="Variables"
            defaultValue={currentBlock.variables}
            onChange={this.variablesSelectionChange}
            disabled={this.isBlockControlled && this.controlBlock.config.metaData.master.variables}
          >
            {this.variables.map((variable) => (
              <Option key={variable} value={variable}>
                {variable}
              </Option>
            ))}
          </Select>
        </div>
        <Divider />
        <div>
          <Select
            key={this.defaultRegions.toString()}
            mode="multiple"
            className="width-100"
            placeholder="Regions"
            defaultValue={currentBlock.regions}
            onChange={this.regionsSelectionChange}
            disabled={this.isBlockControlled && this.controlBlock.config.metaData.master.regions}
          >
            {this.regions.map((region) => (
              <Option key={region} value={region}>
                {region}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  }
}
