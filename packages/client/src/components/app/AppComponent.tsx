import React, { Component } from 'react'
import { DataManagerContext } from '../../services/DataManagerContextProvider';
import DashboardView from "../dashboard/DashboardView";
import Navbar from "./Navbar";

export default class AppComponent extends Component {
    static contextType = DataManagerContext;
    render() {
        const dataManager = this.context
        return (
            <>
                <Navbar {...dataManager} />
                <DashboardView {...dataManager} />
            </>)
    }
}
