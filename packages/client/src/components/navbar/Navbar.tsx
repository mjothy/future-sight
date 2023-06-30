import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button } from 'antd';
import {
  FullscreenOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './Navbar.css';
import ECEMFLogo from '../../assets/images/ECEMF_logo.png';
import Logo from "./Logo";

interface NavbarProps {
  enableSwitchFullscreenMode: boolean;
}

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const switchFullscreenMode = () => {
    searchParams.append('fullscreen', '');
    setSearchParams(searchParams);
  };

  return (
    <div className="navbar">
      <Menu theme="dark" mode="horizontal">
        <Menu.Item key="ecemf-logo" className="logo-wrapper">
          <img src={ECEMFLogo} alt="Logo" />
        </Menu.Item>
        <Menu.Item key="logo" className="logo-wrapper">
          <Logo light/>
        </Menu.Item>

        <Menu.Item
          key="home"
          icon={<HomeOutlined />}
          style={{ backgroundColor: '#001529' }}
        >
          <Link to={'/'}>Home</Link>
        </Menu.Item>

        {props.enableSwitchFullscreenMode && (
          <Menu.Item key="embedded" style={{ backgroundColor: '#001529' }}>
            <Button
              type="primary"
              icon={<FullscreenOutlined />}
              onClick={switchFullscreenMode}
              style={{ backgroundColor: '#001529' }}
            >
              Full Screen Mode
            </Button>
          </Menu.Item>
        )}

        <Menu.Item
          key="browse"
          icon={<SearchOutlined />}
          style={{ backgroundColor: '#001529' }}
        >
          <Link to={'browse'}>Browse</Link>
        </Menu.Item>
        <Menu.Item
            key="about"
            icon={<InfoCircleOutlined />}
            style={{ backgroundColor: '#001529' }}
        >
          <Link to={'about'}>About</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Navbar;
