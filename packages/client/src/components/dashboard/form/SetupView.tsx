import { Component } from 'react'
import UserDataForm from './UserDataForm';
import DataStructureForm from './DataStructureForm';
import { Button, Col, Divider, Row, Typography } from 'antd';
import AnalysisDataTable from './AnalysisDataTable';
//To save the metadata of the dashboard
// INPUT: User data (title, author, tags), models and scenarios
// Output: 
const { Title } = Typography;

export default class ViewSetup extends Component<any,any> {

  constructor(props) {
    super(props);
    this.state = { isSubmited: false };
  }

  handleSubmit = () => {
    this.setState({isSubmited: ! this.state.isSubmited}, () => {
    this.props.submitEvent(this.state.isSubmited);   
    });
  }

  render() {
    return (
      <>
        <div className='content'>
          <UserDataForm />
          <Divider />

          <Title level={4} className="center"> Data Structure</Title>
          <DataStructureForm />
         
          <Divider />
          <Row justify='end'>
            <Button type='primary' onClick={this.handleSubmit}>
              Submit</Button>
          </Row>
        </div>
      </>
    )
  }
}
