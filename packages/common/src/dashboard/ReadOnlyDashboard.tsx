/* eslint-disable prefer-const */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    CheckCircleOutlined,
    DownloadOutlined,
    LinkOutlined, MailOutlined,
    MessageOutlined,
    PicCenterOutlined
} from '@ant-design/icons';
import { Button, PageHeader, Spin, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';
import BlockModel from '../models/BlockModel';
import DashboardModel from '../models/DashboardModel';
import GetGeoJsonContextProvider from '../services/GetGeoJsonContextProvider';
import DashboardConfigView from './DashboardConfigView';
import { Parser } from '@json2csv/plainjs';
import dashboardToCsv from "../services/dashboardToCsv";

/*TODO Check that embedded and published view have the same purpose and always look ok,
* For instance, do we want full width with scrolling when in published view
* or do we want to see full dashboard (might be a problem for big height dashboard)
* */

// TODO Change published URL to youtube embedded standard embed/... instead of view?.../embedded

interface ReadOnlyDashboardProps extends ComponentPropsWithDataManager {
    setEnableSwitchFullscreenMode: (enable: boolean) => void;
    isEmbedded?: boolean;
    isFullscreen?: boolean;
    shareButtonOnClickHandler: () => void;
    embedButtonOnClickHandler: () => void;
    blockData: (block: BlockModel) => void;
    optionsLabel: string[]
    plotData: any[];
    updateLoadingControlBlock: (id, status) => Promise<void>;
    loadingControlBlock: any;
}

type LocationState = { dashboard: DashboardModel };

const ReadOnlyDashboard: React.FC<ReadOnlyDashboardProps> = (
    props: ReadOnlyDashboardProps
) => {
    const [dashboard, setDashboard] = useState<DashboardModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [blockSelectedId, setBlockSelectedId] = useState('');
    const location = useLocation();
    const [searchParams] = useSearchParams();

    /**
     * Update configuration metaData (selected models and scenarios)
     * @param data Block config metaData
     * @param idBlock In case of controling dataBlocks by controlBlock (so the control block is not necessarily selected, we need mandatory the id of controlBlock)
     */
    const updateDashboard = (updatedDashboard) => {
        setDashboard({ ...updatedDashboard });
    };

    const download = () => {
        const opts = {};
        const parser = new Parser(opts);
        const csvJson = dashboardToCsv(props.plotData)
        const csv = parser.parse(csvJson);

        let uri = encodeURI(csv)
        let link = document.createElement("a");
        link.setAttribute('download', "data.csv");
        link.href = 'data:text/csv;charset=utf-8,' + uri;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const getExtras = () => {
        const extras = [
            <Button
                key="share"
                type="default"
                size="small"
                icon={<LinkOutlined />}
                onClick={props.shareButtonOnClickHandler}
            >
                Share
            </Button>,
            !props.isEmbedded && <Button
                key="embed"
                type="default"
                size="small"
                icon={<PicCenterOutlined />}
                onClick={props.embedButtonOnClickHandler}
            >
                Embed
            </Button>,
            <Button
                key="download"
                type="default"
                size="small"
                icon={<DownloadOutlined />}
                onClick={download}
            />
        ]
        if (dashboard?.userData.forum) {
            const forumLink = (
                <a href={dashboard.userData.forum} target="_blank" rel="noopener noreferrer">
                    <Button
                        key="share"
                        type="default"
                        size="small"
                        icon={<MessageOutlined />}
                    />
                </a>
            )
            extras.splice(0, 0, forumLink)
        }
        if (dashboard?.userData.mail) {
            const mailTo = (
                <a href={"mailto:"+dashboard.userData.mail}>
                    <Button
                        key="mail"
                        type="default"
                        size="small"
                        icon={<MailOutlined />}
                    />
                </a>
            )
            extras.splice(0, 0, mailTo)
        }
        return extras
    }


    useEffect(() => {
        const locationState = location.state as LocationState;
        if (locationState?.dashboard) {
            setDashboard(locationState.dashboard);
        } else {
            const id = searchParams.get('id') as string;
            const fetchDashboard = async (id: string) => {
                await props.dataManager.getDashboard(id).then((dashboard) => {
                    setDashboard(dashboard);
                });
            };
            fetchDashboard(id);
        }
        setIsLoading(false);
        props.setEnableSwitchFullscreenMode(true);
        return () => {
            props.setEnableSwitchFullscreenMode(false);
        };
    }, []);

    const publicationDate = !dashboard?.date
        ? ""
        : new Date(dashboard.date).toLocaleString(
            [],
            { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    const getSubtitle = () => {
        return <div style={{ display: "inline-block" }}>
            <span>by {dashboard?.userData.author}</span>
            {dashboard?.verified && <Tooltip title="This user is a verified member of ECEMF">
                <Tag icon={<CheckCircleOutlined />} color="success">Verified</Tag>
            </Tooltip>
            }
            {!!publicationDate && <span>, {<Tooltip placement="bottom" title={"published on " + publicationDate}>
                published on {publicationDate}
            </Tooltip>
            }   </span>}
        </div>
    }

    return (
        <div
            className="dashboard readonly"
            style={{ height: (props.isEmbedded || props.isFullscreen) ? '100%' : undefined }}
        >
            {dashboard && (
                <PageHeader
                    className="info-container"
                    backIcon={false}
                    title={<Tooltip placement="bottom" title={dashboard.userData.title}>
                        {dashboard.userData.title}
                    </Tooltip>
                    }                    subTitle={getSubtitle()}
                    extra={getExtras()}
                    avatar={{ alt: 'logo-short', shape: 'square', size: 'large' }}
                />
            )}
            <div className="dashboard-content">
                {(isLoading || !dashboard) && <Spin />}
                {/*<div className="dashboard-content" style={{width: `${TEST_RATIO*100}vh`}}>*/}
                {(isLoading || !dashboard) && <Spin />}
                {dashboard && (
                    <GetGeoJsonContextProvider getGeoJson={props.dataManager.fetchRegionsGeojson}>
                        <DashboardConfigView
                            dashboard={dashboard}
                            updateSelectedBlock={(blockSelectedId: string) => {
                            }}
                            blockSelectedId={undefined}
                            updateDashboard={updateDashboard}
                            updateDashboardMetadata={(data) => {
                            }}
                            readonly
                            blockData={props.blockData}
                            optionsLabel={props.optionsLabel}
                            plotData={props.plotData}
                            updateLoadingControlBlock={props.updateLoadingControlBlock}
                            loadingControlBlock={props.loadingControlBlock}
                        />
                    </GetGeoJsonContextProvider>
                )}
            </div>
        </div>
    );
};

export default ReadOnlyDashboard;
