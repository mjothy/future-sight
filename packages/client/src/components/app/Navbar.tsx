import { Component } from 'react';
import { Menu, Row, Col } from 'antd';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './Navbar.css';
import Logo from '../../assets/images/ECEMF_logo.png';

export default class Navbar extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row className="navbar">
        <Col className="logo-wrapper">
          <img src={Logo} alt="Logo" />
        </Col>

        <Col>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="home" icon={<HomeOutlined />}>
              <Link to={'/'}>Home</Link>
            </Menu.Item>

            <Menu.Item key="login" icon={<LoginOutlined />}>
              <Link to={'/login'}>Login</Link>
            </Menu.Item>
          </Menu>
        </Col>
      </Row>
    );
  }
}
