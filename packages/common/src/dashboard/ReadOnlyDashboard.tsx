import { Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button, Card, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';
import DashboardModel from '../models/DashboardModel';
import DataModel from '../models/DataModel';
import DashboardConfigView from './DashboardConfigView';

const { Meta } = Card;

interface ReadOnlyDashboardProps extends ComponentPropsWithDataManager {
  getData: (data: DataModel[]) => any[];
  setEnableSwitchEmbeddedMode: (enable: boolean) => void;
  isEmbedded?: boolean;
  setDashboardModelScenario: (selection) => void;
}

type LocationState = { dashboard: DashboardModel };

const ReadOnlyDashboard: React.FC<ReadOnlyDashboardProps> = (
  props: ReadOnlyDashboardProps
) => {
  const [dashboard, setDashboard] = useState<DashboardModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [idCardVisible, setIdCardVisible] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const locationState = location.state as LocationState;
    if (locationState?.dashboard) {
      setDashboard(locationState.dashboard);
      props.setDashboardModelScenario(locationState.dashboard.dataStructure);
    } else {
      const id = searchParams.get('id') as string;
      const fetchDashboard = async (id: string) => {
        await props.dataManager.getDashboard(id).then((dashboard) => {
          setDashboard(dashboard);
          props.setDashboardModelScenario(dashboard.dataStructure);
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

  return (
    <div
      className="dashboard"
      style={{ height: props.isEmbedded ? '100%' : undefined }}
    >
      <div className="dashboard-content">
        {(isLoading || !dashboard) && <Spin />}
        {dashboard && !idCardVisible && (
          <Tooltip placement="bottomRight" title="Show information">
            <Button
              type="primary"
              className="id-button"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setIdCardVisible(true);
              }}
            />
          </Tooltip>
        )}
        {dashboard && idCardVisible && (
          <Card
            className="id-card"
            actions={[
              <Tooltip
                key="download"
                placement="bottom"
                title="Download the data"
              >
                <DownloadOutlined />
              </Tooltip>,
            ]}
          >
            <CloseOutlined
              className="id-card-close"
              onClick={() => {
                setIdCardVisible(false);
              }}
            />
            <Meta
              title={dashboard.userData.title}
              description={`Author: ${dashboard.userData.author}`}
            />
          </Card>
        )}
        {dashboard && (
          <DashboardConfigView
            dashboard={dashboard}
            layout={dashboard.layout}
            blocks={dashboard.blocks}
            getData={props.getData}
            updateSelectedBlock={(blockSelectedId: string) => {}}
            blockSelectedId={undefined}
            updateBlockMetaData={(data, idBlock) => {}}
            updateBlockStyleConfig={(data) => {}}
            updateDashboardMetadata={(data) => {}}
            readonly
          />
        )}
      </div>
    </div>
  );
};

export default ReadOnlyDashboard;
