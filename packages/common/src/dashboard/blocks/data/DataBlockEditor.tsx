import { Component } from 'react';
import { Divider, Select, Space } from 'antd';
import DataBlockTableSelection from '../component/DataBlockTableSelection';
import BlockModel from '../../../models/BlockModel';

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
      selectOrder: [],
      selectOptions: ["regions", "variables", "scenarios", "models"]
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

      // Set the filter selection 
      data[this.filterOption] =
        this.props.dashboard.dataStructure[this.filterOption].selection;

      // Set other data based on filter option
      this.state.selectOptions.map(option => {
        if (option !== this.filterOption) {
          // Example: if filter is "regions" = ["Word", "France"], we get all possible other data (models, ...) of {Word, France}
          data[this.filterOption].map(filterValue => {
            // Example: this.props.filters["regions"]["Word"]["models"] ==> all possible models of word
            data[option] = [...data[option], ...this.props.filters[this.filterOption][filterValue][option]]
          })
        }
      })

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

    const filter = {};
    this.state.selectOrder.map(e => filter[e] = this.state.selectedData[e]);

    this.state.selectOptions.map(option => {
      const data = this.state.data;
      data[option] = this.updateDropDown(filter, option);
      this.setState({ data })
    });

  };

  // Variables
  onVariablesChange = (selectedVariables: string[]) => {
    this.setState({ selectedData: { ...this.state.selectedData, variables: selectedVariables } })
  };

  onDropdownVariablesVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, "variables")
  }

  // Regions
  onRegionsChange = (selectedRegions: string[]) => {
    this.setState({ selectedData: { ...this.state.selectedData, regions: selectedRegions } })
  };

  onDropdownRegionsVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, "regions")
  }

  // Models
  onModelsChange = (selectedModels: string[]) => {
    this.setState({ selectedData: { ...this.state.selectedData, models: selectedModels } })
  };

  onDropdownModelsVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, "models")
  }

  // scenarios
  onScenariosChange = (selectedScenarios: string[]) => {
    this.setState({ selectedData: { ...this.state.selectedData, scenarios: selectedScenarios } })
  };

  onDropdownScenariosVisibleChange = (e) => {
    this.onDropdownVisibleChange(e, "scenarios")
  }

  onDropdownVisibleChange = (e, option) => {
    if (!e && this.state.selectedData[option].length > 0) {
      this.props.updateBlockMetaData({ models: this.state.selectedData[option] });
      this.setState({ selectOrder: [...this.state.selectOrder, option], selectOptions: this.state.selectOptions.filter(e => e != option) }, () => this.updateDropdownData())
    }

    // Check if the first option (filtre) selected
    if (this.filterOption === option ) {
      this.setState({ isFirstSelected: (this.state.selectedData[option].length > 0) ? true : false });
    }
  }

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
    Object.keys(this.props.filters[option]).map(optionKey => {
      let isExist = true;
      Object.keys(filter).map(filterKey => {
        //check if an array contains at least one element from another array
        if (!this.props.filters[option][optionKey][filterKey].some(Set.prototype.has, new Set(filter[filterKey]))) {
          isExist = false
        }
      })
      if (isExist) optionData.push(optionKey);
    });

    return optionData;
  }

  render() {
    return (
      <>
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
              defaultValue={this.state.selectedData.regions}
              // Update selection on state

              onChange={this.onRegionsChange}
              // on close: save data
              onDropdownVisibleChange={this.onDropdownRegionsVisibleChange}
              disabled={this.state.selectOrder.includes("regions") || (this.filterOption !== "regions" && !this.state.isFirstSelected)}
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
              value={this.state.selectedData.variables}
              onChange={this.onVariablesChange}
              onDropdownVisibleChange={this.onDropdownVariablesVisibleChange}
              disabled={this.state.selectOrder.includes("variables") || (this.filterOption !== "variables" && !this.state.isFirstSelected)}
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
              value={this.state.selectedData.scenarios}
              onChange={this.onScenariosChange}
              onDropdownVisibleChange={this.onDropdownScenariosVisibleChange}
              disabled={this.state.selectOrder.includes("scenarios") || (this.filterOption !== "scenarios" && !this.state.isFirstSelected)}
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
              value={this.state.selectedData.models}
              onChange={this.onModelsChange}
              onDropdownVisibleChange={this.onDropdownModelsVisibleChange}
              disabled={this.state.selectOrder.includes("models") || (this.filterOption !== "models" && !this.state.isFirstSelected)}
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
