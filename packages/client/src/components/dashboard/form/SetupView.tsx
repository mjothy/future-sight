import { Component } from 'react';
import UserDataForm from './UserDataForm';
import DataStructureForm from './DataStructureForm';
import { Button, Divider, Row, Typography } from 'antd';

const { Title } = Typography;

export default class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  /**
   * Submit the meta data to send it to dashboard
   */
  handleSubmit = () => {
    this.props.submitEvent(true);
  };

  /**
   * Receive the user data from UserDataForm and send it to DashboardView to update the parent state
   * @param data contains the information of the dashboard {title, author and tags}
   */
  handleUserData = (data) => {
    this.props.updateUserData(data);
  };

  render() {
    return (
      <div className="content">
        <UserDataForm
          {...this.props}
          handleUserData={this.handleUserData}
          userData={this.props.userData}
        />
        <Divider />

        <Title level={4} className="center">
          {' '}
          Data Structure
        </Title>
        <DataStructureForm
          {...this.props}
          handleStructureData={this.props.handleStructureData}
          structureData={this.props.structureData}
        />

        <Divider />
        <Row justify="end">
          <Button type="primary" onClick={this.handleSubmit}>
            Submit
          </Button>
        </Row>
      </div>
    );
  }
}
