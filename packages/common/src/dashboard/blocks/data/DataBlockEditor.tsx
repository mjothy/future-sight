import { Component } from 'react';
import { Divider, Select, Space } from 'antd';
import BlockModel from '../../../models/BlockModel';
import ConfigurationModel from '../../../models/ConfigurationModel';

const { Option } = Select;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {
  // The selected data will be saved to dashboard.metaData

  filterOption = '';
  isBlockControlled = false;
  controlBlock: BlockModel = new BlockModel();

  constructor(props) {
    super(props);
    this.state = {
      /**
       * Data options in dropDown boxes
       */
      data: {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      },
    };
    this.updateDropdownData();
    this.checkIfBlockControlled();
  }

  componentDidMount(): void {
    // The setup filter (in case the dashboard in draft)
    const dataStructure = this.props.dashboard.dataStructure;
    // Check dataStructureModel and FilterModel
    const filterOptions = Object.keys(dataStructure)
      .filter((key) => dataStructure[key].isFilter)
      .map((key) => key);
    if (filterOptions.length > 0) {
      this.filterOption = filterOptions[0];
      const data = this.state.data;
      data[this.filterOption] =
        this.props.dashboard.dataStructure[this.filterOption].selection;
      this.setState({ data });
    }
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

  updateDropdownData = () => {
    switch (this.filterOption) {
      case 'regions':
        // Search other data
        this.props.dataManager
          .filter('regions', this.props.currentBlock.config.metaData.regions)
          .then((data) => {
            this.setState({
              data: { ...data, regions: this.state.data.regions },
            });
          });
        break;
      case 'variables':
        this.props.dataManager
          .filter(
            'variables',
            this.props.currentBlock.config.metaData.variables
          )
          .then((data) => {
            this.setState({
              data: { ...data, variables: this.state.data.variables },
            });
          });
        break;
      case 'scenarios':
        this.props.dataManager
          .filter(
            'scenarios',
            this.props.currentBlock.config.metaData.scenarios
          )
          .then((data) => {
            this.setState({
              data: { ...data, scenarios: this.state.data.scenarios },
            });
          });
        break;
      case 'models':
        this.props.dataManager
          .filter('models', this.props.currentBlock.config.metaData.models)
          .then((data) => {
            this.setState({
              data: { ...data, models: this.state.data.models },
            });
          });
        break;
    }
  };

  onVariablesChange = (selectedVariables: string[]) => {
    this.props.updateBlockMetaData({ variables: selectedVariables });
    this.updateDropdownData();
  };

  onRegionsChange = (selectedRegions: string[]) => {
    this.props.updateBlockMetaData({ regions: selectedRegions });
    this.updateDropdownData();
  };

  onModelsChange = (selectedModels: string[]) => {
    this.props.updateBlockMetaData({ models: selectedModels });
    this.updateDropdownData();
  };

  onScenariosChange = (selectedScenarios: string[]) => {
    this.props.updateBlockMetaData({ scenarios: selectedScenarios });
    this.updateDropdownData();
  };

  render() {
    const metaData = this.props.currentBlock.config.metaData;

    return (
      <>
        {' '}
        <Divider />
        <div className={'block-flex'}>
          {/* adding key, because react not updating the default value on state change */}
          <div
            className={
              this.filterOption === 'regions' ? 'top-filter' : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Regions"
              value={metaData.regions}
              onChange={this.onRegionsChange}
              disabled={
                (this.isBlockControlled &&
                  (this.controlBlock.config as ConfigurationModel).metaData
                    .master['regions'].isMaster) ||
                (this.filterOption !== '' &&
                  this.filterOption !== 'regions' &&
                  metaData[this.filterOption].length <= 0)
              }
              // status={
              //   this.filterOption !== "" && this.filterOption !== 'regions' &&
              //     metaData[this.filterOption].length <= 0
              //     ? 'warning'
              //     : ''
              // }
            >
              {this.state.data['regions'].map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
            <Divider />
          </div>
          <div
            className={
              this.filterOption === 'variables' ? 'top-filter' : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Variables"
              value={metaData.variables}
              onChange={this.onVariablesChange}
              disabled={
                (this.isBlockControlled &&
                  (this.controlBlock.config as ConfigurationModel).metaData
                    .master['variables'].isMaster) ||
                (this.filterOption !== '' &&
                  this.filterOption !== 'variables' &&
                  metaData[this.filterOption].length <= 0)
              }
            >
              {this.state.data['variables'].map((variable) => (
                <Option key={variable} value={variable}>
                  {variable}
                </Option>
              ))}
            </Select>
            <Divider />
          </div>

          <div
            className={
              this.filterOption === 'scenarios' ? 'top-filter' : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Scenarios"
              value={metaData.scenarios}
              onChange={this.onScenariosChange}
              disabled={
                (this.isBlockControlled &&
                  (this.controlBlock.config as ConfigurationModel).metaData
                    .master['scenarios'].isMaster) ||
                (this.filterOption !== '' &&
                  this.filterOption !== 'scenarios' &&
                  metaData[this.filterOption].length <= 0)
              }
            >
              {this.state.data['scenarios'].map((scenario) => (
                <Option key={scenario} value={scenario}>
                  {scenario}
                </Option>
              ))}
            </Select>
            <Divider />
          </div>
          <div
            className={
              this.filterOption === 'models' ? 'top-filter' : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Models"
              value={metaData.models}
              onChange={this.onModelsChange}
              disabled={
                (this.isBlockControlled &&
                  (this.controlBlock.config as ConfigurationModel).metaData
                    .master['models'].isMaster) ||
                (this.filterOption !== '' &&
                  this.filterOption !== 'models' &&
                  metaData[this.filterOption].length <= 0)
              }
            >
              {this.state.data['models'].map((model) => (
                <Option key={model} value={model}>
                  {model}
                </Option>
              ))}
            </Select>
            <Divider />
          </div>
        </div>
      </>
    );
  }
}
