import React, { Component } from 'react';
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import Sidebar from './sidebar/Sidebar';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';

import DashboardModel from '../models/DashboardModel';
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

export interface DashboardProps extends ComponentPropsWithDataManager {
    dashboard: DashboardModel;
    addBlock: (blockType: string, masterBlockId?: string) => void;
    blockSelectedId: string;
    updateSelectedBlock: (blockSelectedId: string) => void;
    saveDashboard: (callback: (idPermanent) => void, image?: string) => void;
    isEmbedded?: boolean;
    readonly?: boolean;
}

export default class Dashboard extends Component<DashboardProps, any> {

    render() {
        return (
            <Layout
                className="dashboard"
                style={{ height: this.props.isEmbedded ? '100%' : undefined }}
            >
                <div className="no-sidebar-margin" />
                <Content className={"dashboard-content-wrapper"}>
                    <div className="dashboard-content">
                        <DashboardConfigView {...this.props} />
                    </div>
                </Content>
                <div className="no-sidebar-margin" />
                <Sidebar
                    onClose={() => this.props.updateSelectedBlock('')}
                    onCloseMenu={() => this.props.updateSelectedBlock('')}
                    {...this.props}
                >
                    <DashboardConfigControl {...this.props} />
                </Sidebar>
            </Layout>
        );
    }
}
