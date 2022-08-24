import { Button } from 'antd';
import { Col, Row, Select } from 'antd'
import Checkbox from 'antd/es/checkbox';
import { Option } from 'antd/lib/mentions';
import { Component } from 'react'
import DataBlockTableSelection from './DataBlockTableSelection';

export default class ControlBlock extends Component<any, any> {

  variables: string[] = [];
  regions: string[] = [];
  defaultVariables: string[] = [];
  defaultRegions: string[] = [];
  isBlockControlled = false;

  constructor(props) {
    super(props);
    // get controlled blocked by thet block
    // table of blocks
    this.initialize();
  }
  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.initialize();

  }

  initialize = () => {
    const { structureData } = this.props;
    const dataStructure = this.props.dashboard.dataStructure;
    this.variables = [];
    this.regions = [];
    Object.keys(structureData).map((modelKey) => {
      Object.keys(structureData[modelKey]).map((scenarioKey) => {
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

    // Show unique values
    this.variables = [...new Set(this.variables)];
    this.regions = [...new Set(this.regions)];

    this.defaultVariables = this.props.blocks[this.props.blockSelectedId].config.metaData.variables;
    this.defaultRegions = this.props.blocks[this.props.blockSelectedId].config.metaData.regions;
  }
  render() {

    const master = this.props.blocks[this.props.blockSelectedId].config.metaData.master;

    const onAddControlledBlock = () => {
      this.props.addBlock('data', this.props.blockSelectedId);
    };

    const onShowTable = (e) => {
      this.setState({ showTable: e.target.checked });
      const master = this.props.blocks[this.props.blockSelectedId].config.metaData.master;
      master["models"] = e.target.checked;
      this.props.updateBlockMetaData({ master });
    }

    const onVariablesChange = (e) => {
      const master = this.props.blocks[this.props.blockSelectedId].config.metaData.master;
      master["variables"] = e.target.checked;
      this.props.updateBlockMetaData({ master });
    }

    const onRegionsChange = (e) => {
      const master = this.props.blocks[this.props.blockSelectedId].config.metaData.master;
      master["regions"] = e.target.checked;
      this.props.updateBlockMetaData({ master });
    }
    const variablesSelectionChange = (selectedVariables: string[]) => {
      this.props.updateBlockMetaData({ variables: selectedVariables });
    };

    const regionsSelectionChange = (selectedRegions: string[]) => {
      this.props.updateBlockMetaData({ regions: selectedRegions });
    };


    return (
      <><div>
        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox onChange={onShowTable} checked={master["models"]} />
          </Col>
          <Col span={16}>
            Control by Model/Scenario
          </Col>
        </Row>
        {
          master["models"] && <Row className='mb-10'>
            <Col span={24}>
              <DataBlockTableSelection  {...this.props} />
            </Col>
          </Row>
        }

        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox onChange={onVariablesChange} checked={master["variables"]} />
          </Col>
          <Col span={16}>
            <Select
              key={this.defaultVariables.toString()}
              mode="multiple"
              className="width-100"
              placeholder="Variables"
              defaultValue={this.defaultVariables}
              onChange={variablesSelectionChange}
            >
              {this.variables.map((variable) => (
                <Option key={variable} value={variable}>
                  {variable}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox onChange={onRegionsChange} checked={master["regions"]} />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <Select
              key={this.defaultRegions.toString()}
              mode="multiple"
              className="width-100"
              placeholder="Regions"
              defaultValue={this.defaultRegions}
              onChange={regionsSelectionChange}
            >
              {this.regions.map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
        <div>
          <Button onClick={onAddControlledBlock}>Add data block</Button>
        </div>
      </>

    );
  }
}
