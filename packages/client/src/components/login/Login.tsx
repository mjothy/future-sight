import { Button, Form, Input } from 'antd';
import React from 'react';
import withDataManager from '../../services/withDataManager';
import PropTypes from 'prop-types';
import './Login.css';

class Login extends React.Component {
  static propTypes = {
    dataManager: PropTypes.object,
  };

  onFinish = (values) => {
    console.log(values);
  };

  render() {
    return (
      <div className="loginFormWrapper">
        <Form className="loginForm" onFinish={this.onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item className="loginFormButton">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default withDataManager(Login);
