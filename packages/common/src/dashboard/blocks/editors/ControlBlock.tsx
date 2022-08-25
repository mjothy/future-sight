import { Button } from 'antd';
import { Col, Row, Select } from 'antd'
import Checkbox from 'antd/es/checkbox';
import { Option } from 'antd/lib/mentions';
import { Component } from 'react'
import DataBlockTableSelection from './DataBlockTableSelection';

export default class ControlBlock extends Component<any, any> {

  variables: string[] = [];
  regions: string[] = [];

  constructor(props) {
    super(props);
    this.initialize();
  }

  initialize = () => {
    // Get all the data selected in setUp view (models, regions, variables)
    const dataStructure = this.props.dashboard.dataStructure;
    this.variables = [];
    this.regions = [];
    Object.keys(dataStructure).map((modelKey) => {
      Object.keys(dataStructure[modelKey]).map((scenarioKey) => {
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

  }

  render() {

    const currentBlock = this.props.blocks[this.props.blockSelectedId].config.metaData;

    const onAddControlledBlock = () => {
      this.props.addBlock('data', this.props.blockSelectedId);
    };

    const onShowTable = (e) => {
      this.setState({ showTable: e.target.checked });
      currentBlock.master["models"].isMaster = e.target.checked;
      this.props.updateBlockMetaData({ master: currentBlock.master });
    }

    const onVariablesChange = (e) => {
      currentBlock.master["variables"].isMaster = e.target.checked;
      this.props.updateBlockMetaData({ master: currentBlock.master });
    }

    const onRegionsChange = (e) => {
      currentBlock.master["regions"].isMaster = e.target.checked;
      this.props.updateBlockMetaData({ master: currentBlock.master });
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
            <Checkbox onChange={onShowTable} checked={this.props.blocks[this.props.blockSelectedId].config.metaData.master["models"].isMaster} />
          </Col>
          <Col span={16}>
            Control by Model/Scenario
          </Col>
        </Row>
        {
          this.props.blocks[this.props.blockSelectedId].config.metaData.master["models"].isMaster && <Row className='mb-10'>
            <Col span={24}>
              <DataBlockTableSelection  {...this.props} />
            </Col>
          </Row>
        }

        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox onChange={onVariablesChange} checked={this.props.blocks[this.props.blockSelectedId].config.metaData.master["variables"].isMaster} />
          </Col>
          <Col span={16}>
            <Select
              key={this.props.blocks[this.props.blockSelectedId].config.metaData.variables.toString()}
              mode="multiple"
              className="width-100"
              placeholder="Variables"
              value={this.props.blocks[this.props.blockSelectedId].config.metaData.variables}
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
            <Checkbox onChange={onRegionsChange} checked={this.props.blocks[this.props.blockSelectedId].config.metaData.master["regions"].isMaster} />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <Select
              key={this.props.blocks[this.props.blockSelectedId].config.metaData.regions.toString()}
              mode="multiple"
              className="width-100"
              placeholder="Regions"
              value={this.props.blocks[this.props.blockSelectedId].config.metaData.regions}
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
