import { Route, Routes } from 'react-router-dom';
import Login from '../login/Login';
import React from 'react';
import HomeView from '../home/HomeView';
import DashboardDataConfiguration from '../dashboard/DashboardDataConfiguration';

export interface RoutingProps {
  setEnableSwitchEmbeddedMode: (enable: boolean) => void;
}

export default class Routing extends React.Component<RoutingProps> {
  render() {
    return (
      <Routes>
        <Route index element={<HomeView />} />
        <Route path="login" element={<Login />} />
        <Route
          path="draft"
          element={<DashboardDataConfiguration {...this.props} />}
        />
        <Route
          path="view"
          element={<DashboardDataConfiguration readonly {...this.props} />}
        />
      </Routes>
    );
  }
}
