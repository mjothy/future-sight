import { Component } from 'react'
import { Button, Col, Divider, Row, Select } from 'antd';
import type { SelectProps } from 'antd';
import AnalysisDataTable from './AnalysisDataTable';

// To send the data selected by user
// INPUT: 
// Output: models and scenarios

const options: SelectProps['options'] = [];
for (let i = 0; i < 100000; i++) {
  const value = `${i.toString(36)}${i}`;
  options.push({
    label: value,
    value,
    disabled: i === 10,
  });
}

const handleChange = (value: string[]) => {
  console.log(`selected ${value}`);
};

export default class DataStructureForm extends Component {

  render() {
    return (
    <div>
      <Row justify="space-evenly">
        <Col xs={20} sm={20} md={6} lg={7} >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select the model"
            onChange={handleChange}
            options={options}
          />
        </Col>

        <Col xs={20} sm={20} md={6} lg={7} >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Scenarios"
            onChange={handleChange}
            options={options}
          />
        </Col>
        <Divider />

      </Row>
      <Row justify='center'>
        <Button type='primary'>Add as analysis data </Button>
      </Row>
      <Divider />

      <Row justify='center'>
        <AnalysisDataTable />
      </Row>
    </div>
    )

  }
}
