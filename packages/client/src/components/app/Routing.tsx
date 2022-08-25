import { Route, Routes } from 'react-router-dom';
import DashboardView from '../dashboard/DashboardView';
import Login from '../login/Login';
import React from 'react';
import HomeView from '../home/HomeView';

export interface RoutingProps {
  setEnableSwitchEmbeddedMode: (enable: boolean) => void;
}

export default class Routing extends React.Component<RoutingProps> {
  render() {
    return (
      <Routes>
        <Route index element={<HomeView />} />
        <Route path="login" element={<Login />} />
        <Route path="draft" element={<DashboardView {...this.props} />} />
        <Route
          path="view"
          element={<DashboardView readonly {...this.props} />}
        />
      </Routes>
    );
  }
}
