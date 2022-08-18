import { Route, Routes } from 'react-router-dom';
import DashboardView from '../dashboard/DashboardView';
import Login from './Login';
import React from 'react';

export default class Routing extends React.Component {
  render() {
    return (
      <Routes>
        <Route index element={<DashboardView />} />
        <Route path="login" element={<Login />} />
      </Routes>
    );
  }
}
