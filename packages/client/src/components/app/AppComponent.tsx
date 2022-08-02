import React, { Component } from 'react'
import { DataManagerContext } from '../../services/DataManagerContextProvider';
import withDataManager from '../../services/withDataManager';
import DashboardView from "../dashboard/DashboardView";
import Navbar from "./Navbar";

class AppComponent extends Component {

    render() {
        return (
            <>
                <Navbar  />
                <DashboardView />
            </>)
    }
}

export default AppComponent;
