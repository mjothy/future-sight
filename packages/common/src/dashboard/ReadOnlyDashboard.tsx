/* eslint-disable @typescript-eslint/no-empty-function */

import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';
import DashboardModel from '../models/DashboardModel';
import DataModel from '../models/DataModel';
import DashboardConfigView from './DashboardConfigView';

interface ReadOnlyDashboardProps extends ComponentPropsWithDataManager {
  getData: (data: DataModel[]) => any[];
  setEnableSwitchEmbeddedMode: (enable: boolean) => void;
  isEmbedded?: boolean;
  fetchData: (dashboard: any) => void;
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

  useEffect(() => {
    const locationState = location.state as LocationState;
    if (locationState?.dashboard) {
      setDashboard(locationState.dashboard);
      props.fetchData(locationState.dashboard);
    } else {
      const id = searchParams.get('id') as string;
      const fetchDashboard = async (id: string) => {
        await props.dataManager.getDashboard(id).then((dashboard) => {
          setDashboard(dashboard);
          props.fetchData(dashboard);
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
