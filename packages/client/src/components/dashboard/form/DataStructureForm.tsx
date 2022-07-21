import { Component } from 'react'
import { Button, Col, Divider, Row, Select } from 'antd';
import type { SelectProps } from 'antd';
import AnalysisDataTable from './AnalysisDataTable';
import DataManager from '../../../services/DataManager';

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

class DataStructureForm extends Component<any,any> {
  data = {};

  constructor(props){
    super(props)
    this.state = {
      scenarios:{},
      models:{},
      options: []
    }
  }

  componentDidMount(){
    this.props.dataManager.fetchModels().then((data)=>{
      const opt: SelectProps['options'] = [];
      data.forEach(model => {
        opt.push({
          label: model,
          value:model,
        })
      });
      this.setState({models: data, options: opt})
      console.log("DataStructureForm models: ", data);
    });
  }

  render() {
    return (
    <div>
      <Row justify="space-evenly">
        <Col xs={20} sm={20} md={6} lg={7} >
          <Select
            mode="multiple"
            className="width-100"
            placeholder="Please select the model"
            onChange={handleChange}
            options={this.state.options}
          />
        </Col>
        <Col xs={20} sm={20} md={6} lg={7} >
          <Select
            mode="multiple"
            className='width-100'
            placeholder="Scenarios"
            onChange={handleChange}
            options={this.state.options}
          />
        </Col>
        <Col>
          <Button type='primary'>Add as analysis data </Button>
        </Col>
      </Row>
      <Divider/>
      <Row justify='center'>
        <AnalysisDataTable />
      </Row>
    </div>
    )

  }
}

export default DataManager(DataStructureForm);
