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
import Colorizer from "../hoc/colorizer/colorizer";
import withColorizer from "../hoc/colorizer/withColorizer";
import GetGeoJsonContextProvider from '../services/GetGeoJsonContextProvider';

const DEFAULT_PREVIEW_WIDTH = 600;
const DEFAULT_PREVIEW_HEIGHT = 600;
const DASHBOARD_PADDING = 10;
const NAVBAR_HEIGHT = 60;

export const withNavigation = (Comp: React.ComponentType) => {
    return (props) => <Comp {...props} navigate={useNavigate()} />;
}

export interface DashboardProps extends ComponentPropsWithDataManager {
    dashboard: DashboardModel;
    addBlock: (blockType: string, masterBlockId?: string) => void;
    copyBlock: (blockSelectedId: string) => void;
    blockSelectedId: string;
    updateSelectedBlock: (blockSelectedId: string) => void;
    saveDashboard: (username, password, callback: (idPermanent) => void, image?: string) => void;
    isEmbedded?: boolean;
    isFullscreen?: boolean;
    readonly?: boolean;
    navigate: (any) => any;
    colorizer: Colorizer
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
        this.props.colorizer.resetIndexToColor()
    }

    makeAndResizePreview = (dashboard) => {
        return html2canvas(dashboard, {
            foreignObjectRendering: true,
            // It's important to add scrollX and scrollY because foreignObjectRendering: true
            // in this case, the captured image include additional space equal to the parent element height and width
            scrollX: -DASHBOARD_PADDING,
            scrollY: -(NAVBAR_HEIGHT + DASHBOARD_PADDING)
        }).then(((canvas: HTMLCanvasElement) => {
            const dataURL = canvas.toDataURL();
            return this.resizeDataURL(dataURL, DEFAULT_PREVIEW_WIDTH, DEFAULT_PREVIEW_HEIGHT, canvas.width, canvas.height)
        }));
    }

    resizeDataURL = (datas, wantedWidth, wantedHeight, canvasWidth, canvasHeight) => {
        let trueWidth;
        let trueHeight;
        // scaling the canvas W & H to keep the aspect ratio and fit it in wanted W & H
        if (canvasHeight < wantedHeight && canvasWidth < wantedWidth) {
            trueHeight = canvasHeight;
            trueWidth = canvasWidth
        } else if (canvasHeight>canvasWidth) {
            trueHeight = wantedHeight;
            trueWidth = canvasWidth * (wantedWidth / canvasHeight)
        } else {
            trueHeight = canvasHeight * (wantedHeight / canvasWidth);
            trueWidth = wantedWidth
        }
        return new Promise<any>(async function (resolve, reject) {
            // We create an image to receive the Data URI
            const img = document.createElement('img');

            // When the event "onload" is triggered we can resize the image.
            img.onload = function () {
                // We create a canvas and get its context.
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // We set the dimensions at the wanted size.
                canvas.width = trueWidth;
                canvas.height = trueHeight;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight, 0, 0, trueWidth, trueHeight);
                    const dataURI = canvas.toDataURL("image/jpeg");
                    resolve(dataURI);
                } else {
                    resolve(undefined);
                }
            };
            img.src = datas;
        })
    }

    save = (username: string, password: string, image?: string) => {
        this.props.saveDashboard(username, password, (idPermanent) => {
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


    onPublish = (username, password) => {
        this.setState({
            publishing: true,
            readonly: true
        });
        const dashboard = document.querySelector(".dashboard-grid") as HTMLElement
        if (dashboard) {
            const timer = setInterval(() => {
                //run some other function
                this.makeAndResizePreview(dashboard).then((dataURL) => {
                    this.save(username, password, dataURL);
                });
                clearInterval(timer);
            }, 200);
        } else {
            this.save(username, password)
        }
    };

    checkUser = async (username: string, password: string) => {
        return await this.props.dataManager.checkUser(username, password);
    }

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
                        checkUser={this.checkUser}
                        {...this.props}
                    />
                </Sidebar>
            </Layout>
        );
    }
}

export default withColorizer(withNavigation(Dashboard))
