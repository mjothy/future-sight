import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, Tooltip, Switch } from 'antd';
import {
  HomeOutlined,
  LoginOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './Navbar.css';
import Logo from '../../assets/images/ECEMF_logo.png';

interface NavbarProps {
  enableSwitchEmbeddedMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  enableSwitchEmbeddedMode,
}: NavbarProps) => {
  const embeddedModeTitle = 'Switch to embedded mode';
  const normalModeTitle = 'Switch to normal mode';
  const [embeddedTooltipTitle, setEmbeddedTooltipTitle] =
    useState(embeddedModeTitle);
  const [searchParams, setSearchParams] = useSearchParams();
  const switchEmbeddedMode = (checked) => {
    if (checked) {
      searchParams.append('embedded', '');
      setSearchParams(searchParams);
      setEmbeddedTooltipTitle(normalModeTitle);
    }
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

        {enableSwitchEmbeddedMode && (
          <Menu.Item key="embedded" style={{ backgroundColor: '#001529' }}>
            <Tooltip placement="bottom" title={embeddedTooltipTitle}>
              <Switch
                size="small"
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                onChange={switchEmbeddedMode}
              />
            </Tooltip>
          </Menu.Item>
        )}

        {/* <Menu.Item key="login" icon={<LoginOutlined />}>
          <Link to={'/login'}>Login</Link>
        </Menu.Item> */}
      </Menu>
    </div>
  );
};

export default Navbar;
