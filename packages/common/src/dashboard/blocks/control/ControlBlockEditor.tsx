import { Button, Col, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';
import BlockModel from '../../../models/BlockModel';

const { Option } = Select;

/**
 * The form in sidebar to add/edit control block
 */
export default class ControlBlockEditor extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      /**
       * the data shown in dropdown lists
       */
      data: {
        regions: new Set<string>(),
        variables: new Set<string>(),
        scenarios: new Set<string>(),
        models: new Set<string>(),
      },

      options: Object.keys(this.props.filters)
    }
  }

  componentDidMount(): void {
    this.initialize();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // the second condition to not update the dropdown list of ControlData
    if (
      prevProps.blockSelectedId !== this.props.blockSelectedId
    ) {
      this.initialize();
      this.updateDropdownData();
    }
  }

  initialize = () => {

    if (this.props.selectedFilter !== '') {
      const selectedFilter = this.props.selectedFilter;
      const data = this.state.data;

      // Set the filter selection
      data[selectedFilter] = this.props.dashboard.dataStructure[selectedFilter].selection;
      this.state.options.forEach((option) => {
        if (option !== selectedFilter) {
          data[selectedFilter].forEach((filterValue) => {
            data[option] = data[option] = Array.from(new Set([
              ...data[option],
              ...this.props.filters[selectedFilter][filterValue][option],
            ]));
          });
        }
      });
      this.setState({ data })
    }
  };


  updateDropdownData = () => {
    // The selected data
    const filter = {};
    // To set the filter options (what is already selected, so fetch the data based on what in selections )
    const metaData = this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
    this.state.options.forEach((option) => {
      filter[option] = metaData[option];
    });
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

    this.setState({ data: optionData })
  };

  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onCheckChange = (option, e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master[option].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
    // Update also children
    const childrens = Object.values(this.props.dashboard.blocks).filter((block: BlockModel | any) => block.controlBlock === this.props.currentBlock.id);

    if (childrens.length > 0 && e) {
      childrens.map((child: BlockModel | any) => {
        Object.keys(metaData.master).map((option) => {
          if (metaData.master[option].isMaster) {
            // Use setState instate of mutate it directly
            const selectOrder = Array.from(new Set([...child.config.metaData.selectOrder, option]))
            console.log("data selectOrder: ", selectOrder, ", id: ", child.id);
            this.props.updateBlockMetaData({ selectOrder },
              child.id
            );
          }
        });
      });
    }
  }

  onSelectionChange = (option, selectedData) => {
    const data = {};
    data[option] = selectedData;
    this.props.updateBlockMetaData({ ...data })
    this.updateDropdownData();
  }

  selectDropDown = (option) => {
    const metaData = this.props.currentBlock.config.metaData;

    return <Row className="mb-10">
      <Col span={2} className={'checkbox-col'}>
        <Checkbox
          onChange={(e) => this.onCheckChange(option, e)}
          checked={metaData.master[option].isMaster}
        />
      </Col>
      <Col span={16}>
        <Select
          mode="multiple"
          className="width-100"
          placeholder={option}
          value={metaData[option]}
          onChange={(selectedData) => this.onSelectionChange(option, selectedData)}
        >
          {Array.from(this.state.data[option]).map((element: any) => (
            <Option key={element} value={element}>
              {element}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  }

  render() {
    return (
      <>
        <div>

          {this.state.options.map((option) =>
            this.selectDropDown(option)
          )}

        </div>
        <div>
          <Button onClick={this.onAddControlledBlock}>Add data block</Button>
        </div>
      </>
    );
  }
}
