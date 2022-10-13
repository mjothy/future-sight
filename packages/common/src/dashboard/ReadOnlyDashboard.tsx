import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';
import DashboardModel from '../models/DashboardModel';
import DashboardConfigView from './DashboardConfigView';

interface ReadOnlyDashboardProps extends ComponentPropsWithDataManager {
  setEnableSwitchEmbeddedMode: (enable: boolean) => void;
  isEmbedded?: boolean;
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
      // props.setDashboardModelScenario(locationState.dashboard.dataStructure);
    } else {
      const id = searchParams.get('id') as string;
      const fetchDashboard = async (id: string) => {
        await props.dataManager.getDashboard(id).then((dashboard) => {
          setDashboard(dashboard);
          // props.setDashboardModelScenario(dashboard.dataStructure);
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
            updateSelectedBlock={(blockSelectedId: string) => { }}
            blockSelectedId={undefined}
            updateBlockMetaData={(data, idBlock) => { }}
            updateBlockStyleConfig={(data) => { }}
            updateDashboardMetadata={(data) => { }}
            readonly
          />
        )}
      </div>
    </div>
  );
};

export default ReadOnlyDashboard;
