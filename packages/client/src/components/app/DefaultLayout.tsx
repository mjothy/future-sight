import React from 'react';
import { Outlet } from 'react-router-dom';

const DefaultLayout: React.FC = () => {
  return (
    <div className="content-wrapper">
      <Outlet />
    </div>
  );
};

export default DefaultLayout;
