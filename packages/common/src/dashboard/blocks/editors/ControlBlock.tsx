import { Button } from 'antd';
import { Col, Input, Row, Select } from 'antd'
import Checkbox from 'antd/es/checkbox';
import { Option } from 'antd/lib/mentions';
import { Component } from 'react'
import DataBlockTableSelection from './DataBlockTableSelection';

export default class ControlBlock extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      showTable: false
    }
  }
  render() {
    const onAddControlledBlock = () => {
      this.props.addBlock('data', this.props.blockSelectedId);
    };

    const onShowTable = (e) => {
      this.setState({ showTable: e.target.checked });
    }

    return (
      <><div>
        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox onChange={onShowTable} />
          </Col>
          <Col span={16}>
            Control by Model/Scenario
          </Col>
        </Row>
        {
          this.state.showTable && <Row className='mb-10'>
            <Col span={24}>
              <DataBlockTableSelection  {...this.props} />
            </Col>
          </Row>
        }

        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox />
          </Col>
          <Col span={16}>
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Variables"
            >
            </Select>
          </Col>
        </Row>
        <Row className='mb-10'>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <Select
              mode="multiple"
              className="width-100"
              placeholder="Regions"
            >
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
