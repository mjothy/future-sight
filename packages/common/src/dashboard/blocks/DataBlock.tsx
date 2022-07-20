import { Component } from 'react'
import { Button, Col, Divider, Row, Select } from 'antd';

// Content of dataBlock
export default class DataBlock extends Component {

  constructor(props) {
    super(props);
 }

  addDataBlock = () => {
    // add data block
    console.log("DataBlock: ", this.context);
    const {addBlock} = this.context;
    addBlock();

  }
  render() {
    console.log("this.context: ", this.context);
    return (
      <div className='width-100'>
        <Divider />
          <Select
            mode="multiple"
            className='width-100'
            placeholder="Please select the model"
          />

          <Divider />
          <Select
            mode="multiple"
            className='width-100'
            placeholder="Scenarios"
          />
          <Divider />
          <Button type='primary' className='width-100'
 onClick={this.addDataBlock}>Add data block</Button>
      </div>
    )
  }
}
