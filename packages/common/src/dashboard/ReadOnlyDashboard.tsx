/* eslint-disable prefer-const */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-empty-function */
import { LinkOutlined } from '@ant-design/icons';
import { Button, PageHeader, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';
import BlockModel from '../models/BlockModel';
import ConfigurationModel from '../models/ConfigurationModel';
import DashboardModel from '../models/DashboardModel';
import DashboardConfigView from './DashboardConfigView';
import FiltersDefinitionModel from "../models/FiltersDefinitionModel";
import PlotDataModel from "../models/PlotDataModel";

/*TODO Check that embedded and published view have the same purpose and always look ok,
* For instance, do we want full width with scrolling when in published view
* or do we want to see full dashboard (might be a problem for big height dashboard)
* */

// TODO Change published URL to youtube embedded standard embed/... instead of view?.../embedded

interface ReadOnlyDashboardProps extends ComponentPropsWithDataManager {
    setEnableSwitchEmbeddedMode: (enable: boolean) => void;
    isEmbedded?: boolean;
    shareButtonOnClickHandler: () => void;
    getBlockData: (block: BlockModel) => PlotDataModel[];
    filtersId: string[]
    filtersDefinition: FiltersDefinitionModel
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
        props.setEnableSwitchEmbeddedMode(true);
        return () => {
            props.setEnableSwitchEmbeddedMode(false);
        };
    }, []);

    const publicationDate = !dashboard?.date
        ? ""
        : new Date(dashboard.date).toLocaleString(
            [],
            { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    return (
        <div
            className="dashboard readonly"
            style={{ height: props.isEmbedded ? '100%' : undefined }}
        >
            {dashboard && (
                <PageHeader
                    className="info-container"
                    backIcon={false}
                    title={dashboard.userData.title}
                    subTitle={!publicationDate
                        ? `by ${dashboard.userData.author}`
                        : `by ${dashboard.userData.author}, published on ${publicationDate}`
                    }
                    extra={[
                        <Button
                            key="share"
                            type="default"
                            size="small"
                            icon={<LinkOutlined />}
                            onClick={props.shareButtonOnClickHandler}
                        >
                            Share
                        </Button>,
                        // <Button
                        //   key="download"
                        //   type="default"
                        //   size="small"
                        //   icon={<DownloadOutlined />}
                        // >
                        //   Download the data
                        // </Button>,
                    ]}
                    avatar={{ alt: 'logo-short', shape: 'square', size: 'large' }}
                />
            )}
            <div className="dashboard-content">
                {(isLoading || !dashboard) && <Spin />}
                {/*<div className="dashboard-content" style={{width: `${TEST_RATIO*100}vh`}}>*/}
                {(isLoading || !dashboard) && <Spin />}
                {dashboard && (
                    <DashboardConfigView
                        dashboard={dashboard}
                        getData={() => { }}
                        updateSelectedBlock={(blockSelectedId: string) => {
                        }}
                        blockSelectedId={undefined}
                        updateDashboard={updateDashboard}
                        updateDashboardMetadata={(data) => {
                        }}
                        readonly
                        getBlockData={props.getBlockData}
                        filtersId={props.filtersId}
                    />
                )}
            </div>
        </div>
    );
};

export default ReadOnlyDashboard;
