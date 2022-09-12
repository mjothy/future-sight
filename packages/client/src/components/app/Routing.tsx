import { Route, Routes } from 'react-router-dom';
import Login from '../login/Login';
import React from 'react';
import HomeView from '../home/HomeView';
import DashboardDataConfiguration from '../dashboard/DashboardDataConfiguration';
import DraftsView from '../drafts/DraftsView';
import DefaultLayout from './DefaultLayout';

export interface RoutingProps {
  isEmbedded: boolean;
  setEnableSwitchEmbeddedMode: (enable: boolean) => void;
  setupConfigMode: boolean;
}

export default class Routing extends React.Component<RoutingProps> {
  render() {
    return (
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="drafts" element={<DraftsView />} />
          <Route index element={<HomeView />} />
        </Route>

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
