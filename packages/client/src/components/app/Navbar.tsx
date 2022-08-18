import { Component } from 'react';
import { Menu } from 'antd';
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
      <div className="navbar">
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="logo" className="logo-wrapper">
            <img src={Logo} alt="Logo" />
          </Menu.Item>

          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link to={'/'}>Home</Link>
          </Menu.Item>

          <Menu.Item key="login" icon={<LoginOutlined />}>
            <Link to={'/login'}>Login</Link>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
