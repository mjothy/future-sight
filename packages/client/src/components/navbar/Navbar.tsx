import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button } from 'antd';
import {
  FullscreenOutlined,
  HomeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './Navbar.css';
import Logo from '../../assets/images/ECEMF_logo.png';

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
        <Menu.Item key="logo" className="logo-wrapper">
          <img src={Logo} alt="Logo" />
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
      </Menu>
    </div>
  );
};

export default Navbar;
