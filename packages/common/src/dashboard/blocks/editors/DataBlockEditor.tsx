import { Component } from 'react';
import { Divider, Select } from 'antd';
import DataBlockTableSelection from './DataBlockTableSelection';
import BlockModel from '../../../models/BlockModel';
import ConfigurationModel from '../../../models/ConfigurationModel';

const { Option } = Select;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {
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
    // the second condition to not update the dropdown list of ControlData
    if (
      prevProps.blockSelectedId !== this.props.blockSelectedId &&
      this.props.currentBlock.blockType === 'data'
    ) {
      this.updateDropdownData();
      this.checkIfBlockControlled();
    }
  }

  /**
   * To disable inputes that are controlled by ControlBlock
   */
  checkIfBlockControlled = () => {
    const controlBlockId = this.props.currentBlock.controlBlock;
    if (controlBlockId !== '') {
      this.isBlockControlled = true;
      this.controlBlock = this.props.blocks[controlBlockId];
    } else {
      this.isBlockControlled = false;
      this.controlBlock = new BlockModel();
    }
  };

  /**
   * Update the options of dropdown lists of variables and regions
   * SHOW only the options when we can find data to visualize
   */
  updateDropdownData = () => {
    const metaData = this.props.currentBlock.config.metaData;
    // All data received from SetUp view
    const dataStructure = this.props.dashboard.dataStructure;
    this.variables = [];
    this.regions = [];
    // To show only variables and regions of selected data
    Object.keys(metaData.models).map((modelKey) => {
      metaData.models[modelKey].map((scenarioKey) => {
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
    this.defaultVariables = metaData.variables
      .filter((variable: string) => this.variables.indexOf(variable) >= 0)
      .map((variable) => variable);
    this.defaultRegions = metaData.regions
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
    const metaData = this.props.currentBlock.config.metaData;

    return (
      <div>
        {this.isBlockControlled &&
        (this.controlBlock.config as ConfigurationModel).metaData.master[
          'models'
        ].isMaster ? (
          <p>That block is controled by Model/scenario</p>
        ) : (
          <DataBlockTableSelection
            {...this.props}
            updateDropdownData={this.updateDropdownData}
          />
        )}
        <Divider />
        {/* adding key, because react not updating the default value on state change */}
        <div>
          <Select
            key={this.defaultVariables.toString()}
            mode="multiple"
            className="width-100"
            placeholder="Variables"
            defaultValue={metaData.variables}
            onChange={this.variablesSelectionChange}
            disabled={
              this.isBlockControlled &&
              (this.controlBlock.config as ConfigurationModel).metaData.master[
                'variables'
              ].isMaster
            }
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
            defaultValue={metaData.regions}
            onChange={this.regionsSelectionChange}
            disabled={
              this.isBlockControlled &&
              (this.controlBlock.config as ConfigurationModel).metaData.master[
                'regions'
              ].isMaster
            }
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
