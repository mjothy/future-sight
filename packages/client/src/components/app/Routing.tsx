import { Route, Routes } from 'react-router-dom';
import React from 'react';
import HomeView from '../home/HomeView';
import DashboardDataConfiguration from '../dashboard/DashboardDataConfiguration';
import DraftsView from '../drafts/DraftsView';
import DefaultLayout from './DefaultLayout';
import BrowseView from '../browse/BrowseView';
import AboutView from '../about/AboutView';

export interface RoutingProps {
  isEmbedded: boolean;
  isFullscreen: boolean;
  setEnableSwitchFullscreenMode: (enable: boolean) => void;
}

export default class Routing extends React.Component<RoutingProps> {
  render() {
    return (
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="drafts" element={<DraftsView />} />
          <Route path="browse" element={<BrowseView />} />
          <Route path="about" element={<AboutView />} />
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
