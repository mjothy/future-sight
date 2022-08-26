import { Col, Row, Select } from 'antd'
import { Option } from 'antd/lib/mentions';
import { Component } from 'react'
import ControlBlockTableSelection from './ControlBlockTableSelection';
export default class ControlBlockView extends Component<any, any> {

  render() {
    const { currentBlock } = this.props;
    const metaData = currentBlock.config.metaData;

    const variablesSelectionChange = (selectedVariables: string[]) => {
      // Update the controlBlock data
      metaData.master["variables"].values = selectedVariables;
      this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
    }

    const regionsSelectionChange = (selectedRegions: string[]) => {
      metaData.master["regions"].values = selectedRegions;
      this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
    }

    return <div className='p-20' style={{ maxHeight: this.props.height - 30 }}>
      {
        metaData.master["models"].isMaster && <Row>
          <Col span={24}>
            <ControlBlockTableSelection  {...this.props} models={metaData.models} />
          </Col>
        </Row>
      }

      {
        metaData.master["variables"].isMaster &&
        <Row className='mb-10'>
          <Col span={16}>
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Variables"
              defaultValue={metaData.master["variables"].values}
              onChange={variablesSelectionChange}
            >
              {metaData.variables.map((variable) => (
                <Option key={variable} value={variable}>
                  {variable}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      }

      {
        metaData.master["regions"].isMaster &&
        <Row className='mb-10'>
          <Col span={16} className={'checkbox-col-label'}>
            <Select
              // key={this.defaultRegions.toString()}
              mode="multiple"
              className="width-100"
              placeholder="Regions"
              defaultValue={metaData.master["regions"].values}
              onChange={regionsSelectionChange}
            >
              {metaData.regions.map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      }
    </div>;
  }
}
