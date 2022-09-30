import { Component } from 'react';
import { Divider, Select } from 'antd';
import BlockModel from '../../../models/BlockModel';

const { Option } = Select;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {
  // The selected data will be saved to dashboard.metaData

  isBlockControlled = false;
  controlBlock: BlockModel = new BlockModel();

  constructor(props) {
    super(props);
    this.state = {
      isFirstSelected: false,
      /**
       * Data options in dropDown boxs
       */
      data: {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      },
      /**
       * Selected data to save in dashboard config (metaData)
       */
      selectedData: {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      },
      /**
       * Order of selection data
       */
      selectOrder: [], //Should be added to Dashboard object
      selectOptions: ['regions', 'variables', 'scenarios', 'models'],
    };
    this.updateDropdownData();
    this.checkIfBlockControlled();
  }

  componentDidMount(): void {
    this.initialize();

    // The setup filter (in case the dashboard in draft)
    // Check dataStructureModel and FilterModel
    console.log('selectedFilter: ', this.props.selectedFilter);

    if (this.props.selectedFilter !== '') {
      const selectedFilter = this.props.selectedFilter;
      const data = this.state.data;

      // Set the filter selection
      data[selectedFilter] =
        this.props.dashboard.dataStructure[selectedFilter].selection;

      // Set other data based on filter option
      this.state.selectOptions.map((option) => {
        if (option !== selectedFilter) {
          // Example: if filter is "regions" = ["Word", "France"], we get all possible other data (models, ...) of {Word, France}
          data[selectedFilter].map((filterValue) => {
            // Example: this.props.filters["regions"]["Word"]["models"] ==> all possible models of word
            data[option] = [
              ...data[option],
              ...this.props.filters[selectedFilter][filterValue][option],
            ];
          });
        }
      });

      this.setState({ data });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // the second condition to not update the dropdown list of ControlData
    if (
      prevProps.blockSelectedId !== this.props.blockSelectedId &&
      this.props.currentBlock.blockType === 'data'
    ) {
      this.initialize();
      this.updateDropdownData();
      this.checkIfBlockControlled();
    }
  }

  initialize = () => {
    const currentBlock =
      this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    const state = {
      selectedData: { ...currentBlock },
      isFirstSelected: false,
    };
    if (currentBlock[this.props.selectedFilter].length > 0)
      state.isFirstSelected = true;

    this.setState(state);
  };

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
    const filter = {};
    this.state.selectOrder.map((e) => (filter[e] = this.state.selectedData[e]));

    this.state.selectOptions.map((option) => {
      const data = this.state.data;
      data[option] = this.updateDropDown(filter, option);
      this.setState({ data });
    });
  };

  // Variables
  onVariablesChange = (selectedVariables: string[]) => {
    this.setState({
      selectedData: {
        ...this.state.selectedData,
        variables: selectedVariables,
      },
    });
  };

  onDropdownVariablesVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, 'variables');
  };

  // Regions
  onRegionsChange = (selectedRegions: string[]) => {
    this.setState({
      selectedData: { ...this.state.selectedData, regions: selectedRegions },
    });
  };

  onDropdownRegionsVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, 'regions');
  };

  // Models
  onModelsChange = (selectedModels: string[]) => {
    this.setState({
      selectedData: { ...this.state.selectedData, models: selectedModels },
    });
  };

  onDropdownModelsVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, 'models');
  };

  // scenarios
  onScenariosChange = (selectedScenarios: string[]) => {
    this.setState({
      selectedData: {
        ...this.state.selectedData,
        scenarios: selectedScenarios,
      },
    });
  };

  onDropdownScenariosVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, 'scenarios');
  };

  onDropdownVisibleChange = (e, option) => {
    if (!e && this.state.selectedData[option].length > 0) {
      this.props.updateBlockMetaData({ ...this.state.selectedData });
      this.setState(
        {
          selectOrder: [...this.state.selectOrder, option],
          selectOptions: this.state.selectOptions.filter((e) => e != option),
        },
        () => this.updateDropdownData()
      );
    }

    // Check if the first option (filtre) selected
    if (this.props.selectedFilter === option) {
      this.setState({
        isFirstSelected:
          this.state.selectedData[option].length > 0 ? true : false,
      });
    }
  };

  /**
   * Update drop down lists
   * @param filter selected drop down lists with selected data values
   * @param option can be {regions, variables, scenarios, models} (drop down lists that still unselected)
   * @returns new data in drop down list
   */
  updateDropDown = (filter, option) => {
    const optionData: string[] = [];
    // Select other data (the unselected drop down lists) based on the filters (selected drop down data)
    // Data union
    Object.keys(this.props.filters[option]).map((optionKey) => {
      let isExist = true;
      Object.keys(filter).map((filterKey) => {
        //check if an array contains at least one element from another array
        if (
          !this.props.filters[option][optionKey][filterKey].some(
            Set.prototype.has,
            new Set(filter[filterKey])
          )
        ) {
          isExist = false;
        }
      });
      if (isExist) optionData.push(optionKey);
    });

    return optionData;
  };

  render() {
    return (
      <>
        <Divider />
        <div className={'block-flex'}>
          {/* adding key, because react not updating the default value on state change */}
          <div
            className={
              this.props.selectedFilter === 'regions'
                ? 'top-filter'
                : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Regions"
              value={this.state.selectedData.regions}
              // Update selection on state

              onChange={this.onRegionsChange}
              // on close: save data
              onDropdownVisibleChange={this.onDropdownRegionsVisibleChange}
              disabled={
                this.state.selectOrder.includes('regions') ||
                (this.props.selectedFilter !== 'regions' &&
                  !this.state.isFirstSelected)
              }
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
              this.props.selectedFilter === 'variables'
                ? 'top-filter'
                : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Variables"
              value={this.state.selectedData.variables}
              onChange={this.onVariablesChange}
              onDropdownVisibleChange={this.onDropdownVariablesVisibleChange}
              disabled={
                this.state.selectOrder.includes('variables') ||
                (this.props.selectedFilter !== 'variables' &&
                  !this.state.isFirstSelected)
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
              this.props.selectedFilter === 'scenarios'
                ? 'top-filter'
                : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Scenarios"
              value={this.state.selectedData.scenarios}
              onChange={this.onScenariosChange}
              onDropdownVisibleChange={this.onDropdownScenariosVisibleChange}
              disabled={
                this.state.selectOrder.includes('scenarios') ||
                (this.props.selectedFilter !== 'scenarios' &&
                  !this.state.isFirstSelected)
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
              this.props.selectedFilter === 'models'
                ? 'top-filter'
                : 'other-filter'
            }
          >
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Models"
              value={this.state.selectedData.models}
              onChange={this.onModelsChange}
              onDropdownVisibleChange={this.onDropdownModelsVisibleChange}
              disabled={
                this.state.selectOrder.includes('models') ||
                (this.props.selectedFilter !== 'models' &&
                  !this.state.isFirstSelected)
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
