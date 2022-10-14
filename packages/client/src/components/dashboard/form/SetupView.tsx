import { Component } from 'react';
import UserDataForm from './UserDataForm';
import DataStructureForm from './DataStructureForm';
import {Alert, Button, Divider, Row, Space, Typography } from 'antd';

const { Title } = Typography;

/**
 * The view for setting dashboard mataData
 */
export default class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  /**
   * Submit the meta data to send it to dashboard
   */
  handleSubmit = () => {
    this.props.submitEvent('dashboard');
  };

  /**
   * Receive the user data from UserDataForm and send it to DashboardView to update the parent state
   * @param data contains the information of the dashboard {title, author and tags}
   */
  handleUserData = (data) => {
    this.props.updateUserData(data);
  };

  hasFilledStructure = () => {
      return Object.keys(this.props.structureData).length !== 0
  }

  render() {
    return (
      <div className="setupView-content">
        <UserDataForm
          {...this.props}
          handleUserData={this.handleUserData}
          userData={this.props.userData}
        />
        <Divider />

        <Title level={4} className="center">
          Data Structure
        </Title>
        <DataStructureForm
          {...this.props}
          handleStructureData={this.props.handleStructureData}
          structureData={this.props.structureData}
        />

        <Divider />
        <Row justify="end">
            <Space>
                {!this.hasFilledStructure() ? (
                        <Alert message="You must select at least one Model and Scenario" type="warning" />
                    ) : undefined
                }
                <Button type="primary" onClick={this.handleSubmit} disabled={!this.hasFilledStructure()}>
                    Submit
                </Button>
            </Space>
        </Row>
      </div>
    );
  }
}
