import { Route, Routes } from 'react-router-dom';
import DashboardView from '../dashboard/DashboardView';
import Login from './Login';
import React from 'react';
import HomeView from '../home/HomeView';

export default class Routing extends React.Component {
  render() {
    return (
      <Routes>
        <Route index element={<HomeView />} />
        <Route path="login" element={<Login />} />
        <Route path="draft" element={<DashboardView />} />
      </Routes>
    );
  }
}
