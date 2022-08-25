import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const switchEmbeddedMode = (checked) => {
    if (checked) {
      navigate({
        pathname: location.pathname,
        search: '?embedded',
      });
      setEmbeddedTooltipTitle(normalModeTitle);
    } else {
      navigate({
        pathname: location.pathname,
      });
      setEmbeddedTooltipTitle(embeddedModeTitle);
    }
  };

  return (
    <div className="navbar">
      <Menu theme="dark" mode="horizontal">
        <Menu.Item key="logo" className="logo-wrapper">
          <img src={Logo} alt="Logo" />
        </Menu.Item>

        <Menu.Item key="home" icon={<HomeOutlined />}>
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

        <Menu.Item key="login" icon={<LoginOutlined />}>
          <Link to={'/login'}>Login</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Navbar;
