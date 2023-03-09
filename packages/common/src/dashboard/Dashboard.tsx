import React, { Component } from 'react';
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import Sidebar from './sidebar/Sidebar';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';
import { useNavigate } from 'react-router-dom'
import DashboardModel from '../models/DashboardModel';
import { Layout, notification } from "antd";
import '../style.css';
const { Content } = Layout;
import html2canvas from "html2canvas";
import GetGeoJsonContextProvider from '../services/GetGeoJsonContextProvider';

const DEFAULT_PREVIEW_WIDTH = 800;
const DEFAULT_PREVIEW_HEIGHT = 450;

export const withNavigation = (Comp: React.ComponentType) => {
    return (props) => <Comp {...props} navigate={useNavigate()} />;
}

export interface DashboardProps extends ComponentPropsWithDataManager {
    dashboard: DashboardModel;
    addBlock: (blockType: string, masterBlockId?: string) => void;
    blockSelectedId: string;
    updateSelectedBlock: (blockSelectedId: string) => void;
    saveDashboard: (callback: (idPermanent) => void, image?: string) => void;
    isEmbedded?: boolean;
    isFullscreen?: boolean;
    readonly?: boolean;
    navigate: (any) => any;
}

class Dashboard extends Component<DashboardProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            publishing: false,
            readonly: false
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    makeAndResizePreview = (dashboard) => {
        return html2canvas(dashboard).then(((canvas) => {
            const dataURL = canvas.toDataURL();
            return this.resizeDataURL(dataURL, DEFAULT_PREVIEW_WIDTH, DEFAULT_PREVIEW_HEIGHT)
        }));
    }

    resizeDataURL = (datas, wantedWidth, wantedHeight) => {
        return new Promise<any>(async function (resolve, reject) {
            // We create an image to receive the Data URI
            const img = document.createElement('img');

            // When the event "onload" is triggered we can resize the image.
            img.onload = function () {
                // We create a canvas and get its context.
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // We set the dimensions at the wanted size.
                canvas.width = wantedWidth;
                canvas.height = wantedHeight;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);
                    const dataURI = canvas.toDataURL("image/jpeg");
                    resolve(dataURI);
                } else {
                    resolve(undefined);
                }
            };
            img.src = datas;
        })
    }

    save = (image?: string) => {
        this.props.saveDashboard((idPermanent) => {
            this.setState({ publishing: false });
            notification.success({
                message: 'The dashboard has been correctly published',
                placement: 'topRight',
            });
            setTimeout(() => {
                this.props.navigate('/view?id=' + idPermanent);
            }, 1000);
        }, image);
    }


    onPublish = () => {
        this.setState({
            publishing: true,
            readonly: true
        });
        const dashboard = document.querySelector(".dashboard-grid") as HTMLElement
        if (dashboard) {
            const timer = setInterval(() => {
                //run some other function
                this.makeAndResizePreview(dashboard).then((dataURL) => {
                    this.save(dataURL);
                });
                clearInterval(timer);
            }, 200);
        } else {
            this.save()
        }
    };



    render() {
        return (
            <Layout
                className="dashboard"
                style={{ height: (this.props.isEmbedded || this.props.isFullscreen) ? '100%' : undefined }}
            >
                <div className="no-sidebar-margin" />
                <Content className={"dashboard-content-wrapper"}>
                    <div className="dashboard-content">
                        <GetGeoJsonContextProvider getGeoJson={this.props.dataManager.fetchRegionsGeojson}>
                            <DashboardConfigView {...this.props} readonly={this.state.readonly} />
                        </GetGeoJsonContextProvider>
                    </div>
                </Content>
                <div className="no-sidebar-margin" />
                <Sidebar
                    onClose={() => this.props.updateSelectedBlock('')}
                    onCloseMenu={() => this.props.updateSelectedBlock('')}
                    {...this.props}
                >
                    <DashboardConfigControl
                        publishing={this.state.publishing}
                        onPublish={this.onPublish}
                        {...this.props}
                    />
                </Sidebar>
            </Layout>
        );
    }
}

export default withNavigation(Dashboard)