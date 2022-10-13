import { Component } from 'react';
import { Button, Col, Divider, Row, Select, Tooltip } from 'antd';
import BlockModel from '../../../models/BlockModel';
import { ClearOutlined } from '@ant-design/icons';

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
      /**
       * Data options in dropDown boxs
       */
      data: {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      },

      selectOptions: Object.keys(this.props.filters),
    };
    this.checkIfBlockControlled();
  }

  componentDidMount(): void {
    this.initialize();

    // The setup filter (in case the dashboard in draft)
    const selectOrder = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData.selectOrder;
    if (this.props.selectedFilter !== '' && selectOrder.length <= 0) {
      const selectedFilter = this.props.selectedFilter;
      const data = this.state.data;

      // Set the filter selection
      data[selectedFilter] = this.props.dashboard.dataStructure[selectedFilter].selection;
      this.state.selectOptions.forEach((option) => {
        if (option !== selectedFilter) {
          data[selectedFilter].forEach((filterValue) => {
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
    // this.props.currentBlock.blockType === 'data' to delete after (find alternative)
    if (
      prevProps.blockSelectedId !== this.props.blockSelectedId &&
      this.props.currentBlock.blockType === 'data'
    ) {
      this.initialize();
      this.updateDropdownData();
      this.checkIfBlockControlled();
    }
  }

  /**
   * Initialise the state of component
   */
  initialize = () => {
    const currentBlock = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    const selectOptions = Object.keys(this.props.filters);

    if (currentBlock.selectOrder.length > 0) {
      currentBlock.selectOrder.forEach(e => {
        selectOptions.splice(e, 1);
      })
    }

    this.setState({ selectOptions });
  };

  /**
   * To disable inputes that are controlled by ControlBlock (if thet block is controled)
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

  onChange = (option, selectedScenarios: string[]) => {
    const data = {};
    data[option] = selectedScenarios;
    this.props.updateBlockMetaData({ ...data })
    this.updateDropdownData();
  }

  updateDropdownData = () => {
    // The selected data
    const filter = {};
    // To set the filter options (what is already selected, so fetch the data based on what in selections )
    const metaData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    metaData.selectOrder.forEach((option) => (filter[option] = metaData[option]));
    //Update all options
    this.filtreOptions(filter);
  };

  /**
   * Update options of drop down lists
   * @param filter selected drop down lists with selected data values
   */
  filtreOptions = (filter) => {
    const optionData = {
      regions: new Set<string>(),
      variables: new Set<string>(),
      scenarios: new Set<string>(),
      models: new Set<string>(),
    };
    // Filter the inputes of columns based on the filters (selected drop down data)
    // Data union
    const filtersJSON = this.props.filters;
    Object.keys(filtersJSON).forEach(option => {
      Object.keys(filtersJSON[option]).forEach(optionValue => {
        let isExist = true;
        Object.keys(filter).forEach(filterKey => {
          if (option !== filterKey) {
            filter[filterKey].forEach(value => {
              if (!filtersJSON[option][optionValue][filterKey].includes(value)) {
                isExist = false;
              }
            });
          }
        });

        // Check if data exist in the top filter (data focus)
        if (option === this.props.selectedFilter) {
          const selectedFilter = this.props.dashboard.dataStructure[this.props.selectedFilter].selection;
          if (!selectedFilter.includes(optionValue)) {
            isExist = false;
          }
        }

        if (isExist) {
          optionData[option].add(optionValue)
        }
      })
    });

    Object.keys(optionData).forEach(option => {
      optionData[option] = Array.from(optionData[option]);
    })

    this.setState({ data: optionData })
  };

  onDropdownVisibleChange = (option, e) => {
    const metaData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    if (!e && metaData[option].length > 0) {
      // Update the order of selection
      this.props.updateBlockMetaData({ selectOrder: Array.from(new Set<string>([...metaData.selectOrder, option])) });
      this.setState(
        {
          selectOptions: this.state.selectOptions.filter((e) => e != option),
        },
        () => this.updateDropdownData()
      );
    }
  };



  clearClick = (option, e) => {

    const data = {};

    const metaData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    const index = metaData.selectOrder.indexOf(option);
    if (index >= 0) {

      const selectOrder = [...metaData.selectOrder];
      const selectOptions = [...this.state.selectOptions];

      for (let i = index; i < metaData.selectOrder.length; i++) {
        selectOrder.splice(selectOrder.indexOf(metaData.selectOrder[i]), 1);
        selectOptions.push(metaData.selectOrder[i]);
        data[metaData.selectOrder[i]] = [];
      }
      this.setState({ selectOptions });
      this.props.updateBlockMetaData({ ...data, selectOrder: Array.from(new Set<string>([...selectOrder])) });
    }

    this.updateDropdownData()

  }


  selectDropDown = (option, selected) => {

    // In case the block is controlled
    const id = this.props.currentBlock.controlBlock;

    let isControlled = false;
    if (id !== '') {
      const controlBlock = this.props.dashboard.blocks[id].config.metaData;
      if (controlBlock.master[option].isMaster) {
        isControlled = true;
      }
    }

    const control = this.props.currentBlock.config.metaData;
    const metaData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;

    return (!isControlled &&
      <div className="transition">
        <Row className="width-100 mt-16">
          <Col span={selected ? 20 : 24}>
            <Select
              mode="multiple"
              className="width-100"
              placeholder={option}
              value={metaData[option]}
              // Update selection on state
              onChange={(selectedData) => this.onChange(option, selectedData)}
              // on close: save data
              onDropdownVisibleChange={(e) => this.onDropdownVisibleChange(option, e)}
              disabled={
                (this.isBlockControlled && control[option].isMaster)
              }
            >
              {this.state.data[option].map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
          </Col>
          {selected && (
            <Col span={4}>
              <Tooltip title="That will reset all other selections">
                <Button type="default" onClick={(e) => this.clearClick(option, e)} danger icon={<ClearOutlined />} />
              </Tooltip>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  controlledInputs = () => {
    const id = this.props.currentBlock.controlBlock;
    const controlBlock = this.props.dashboard.blocks[id].config.metaData;
    return Object.keys(controlBlock.master).map(key => {
      if (controlBlock.master[key].isMaster) {
        return <div>
          <strong>{key}: </strong> {controlBlock.master[key].values.toString()}
        </div>
      }
    })
  }

  render() {
    const metaData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;

    return (
      <div>
        <div className={'block-flex'}>
          {/* show inputs if they are controlled */}
          {
            this.props.currentBlock.controlBlock !== '' && <div>
              <strong>Controlled inputs</strong>
              {this.controlledInputs()}
              <Divider />
            </div>
          }

          {/* show dropdown lists of selected  */}
          {metaData.selectOrder.map((option) =>
            this.selectDropDown(option, true)
          )}
          <Divider />
          {/* show dropdown lists of unselected  */}
          <table className="width-100">
            <tr>
              {this.state.selectOptions.map((option) => (
                <td key={option}>{this.selectDropDown(option, false)}</td>
              ))}
            </tr>
          </table>
        </div>
      </div>
    );
  }
}
