import { Button, Col, Row, Select } from 'antd';
import Checkbox from 'antd/es/checkbox';
import { Component } from 'react';

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
    this.initialize(this.state.data);
  }

  initialize = (data) => {
    // Get all the data selected in setUp view (models, regions, variables)
    const dataStructure = this.props.dashboard.dataStructure;
    const filter = this.props.selectedFilter;

    // filters contains all files.json (exp: filters["regions"] = regions.json)
    const dataOfSelectedFilter = this.props.filters[filter];

    // Get the selected values on the filter
    const selectedValuesOnFilter = dataStructure[filter].selection;

    // For all values selected on filter, get other data 
    selectedValuesOnFilter.map(value => {
      Object.keys(dataOfSelectedFilter[value]).map(e => {
        // exp: dataOfSelectedFilter["France"]["models"] -> map on models of France and add them to this.state.data.models (dataState["models"].add("model1"))
        dataOfSelectedFilter[value][e].map(variable => data[e].add(variable));
      })
      data[filter].add(value);

    });
  };

  onAddControlledBlock = () => {
    this.props.addBlock('data', this.props.blockSelectedId);
  };

  onCheckChange = (option, e) => {
    const metaData = this.props.currentBlock.config.metaData;
    metaData.master[option].isMaster = e.target.checked;
    this.props.updateBlockMetaData({ master: metaData.master });
  }

  onSelectionChange = (option, selectedData) => {
    const data = {};
    data[option] = selectedData;
    this.props.updateBlockMetaData({ ...data })
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
