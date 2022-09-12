import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, Tooltip, Switch } from 'antd';
import {
  HomeOutlined,
  LoginOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

import './Navbar.css';
import Logo from '../../assets/images/ECEMF_logo.png';

interface NavbarProps {
  enableSwitchEmbeddedMode: boolean;
  setupConfigMode: boolean;
  setSetupConfigMode: (mode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
  const location = useLocation();

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

  const backToSetupTitle = 'Switch to set up mode';
  const backToConfigTitle = 'Switch to configuration mode';

  const [switchSetupConfigTooltipTitle, setSwitchSetupConfigTooltipTitle] =
    useState(backToConfigTitle);
  const switchSetupConfigMode = (checked) => {
    if (checked) {
      setSwitchSetupConfigTooltipTitle(backToConfigTitle);
      props.setSetupConfigMode(true);
    } else {
      setSwitchSetupConfigTooltipTitle(backToSetupTitle);
      props.setSetupConfigMode(false);
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

        {props.enableSwitchEmbeddedMode && (
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

        {location.pathname === '/draft' && (
          <Menu.Item
            key="setupConfigSwitch"
            style={{ backgroundColor: '#001529' }}
          >
            <Tooltip placement="bottom" title={switchSetupConfigTooltipTitle}>
              <Switch
                size="small"
                checkedChildren={<UserOutlined />}
                unCheckedChildren={<EditOutlined />}
                onChange={switchSetupConfigMode}
                checked={props.setupConfigMode}
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
