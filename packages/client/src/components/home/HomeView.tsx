import React, { useEffect, useState } from 'react';
import { Button, Input, Divider, Image } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import withDataManager from '../../services/withDataManager';
import { ComponentPropsWithDataManager } from '@future-sight/common';

const HomeView: React.FC<ComponentPropsWithDataManager> = ({ dataManager }) => {
  const [draftFromURL, setDraftFromURL] = useState('');
  const [publishedDashboards, setPublishedDashboards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    dataManager.getDashboards().then(setPublishedDashboards);
  }, []);

  return (
    <div className="container">
      <h2>Welcome to FutureSight!</h2>
      <Button type="primary">
        <Link to="draft">Create a new Dashboard</Link>
      </Button>
      <Input.Group style={{ display: 'flex', flexDirection: 'row' }}>
        <Button type="primary" disabled={!draftFromURL}>
          Start from another Dashboard
        </Button>
        <Input
          placeholder="https://..."
          value={draftFromURL}
          onChange={(e) => setDraftFromURL(e.target.value)}
        />
      </Input.Group>
      <Divider />
      <h3>Latest submissions</h3>
      <Image.PreviewGroup>
        {Object.keys(publishedDashboards).map((key) => {
          // Remove the last char, which is the dot added by the datamanager
          // (see the getDashboards method in the DataManager.tsx)
          const actualKey = key.slice(0, -1);
          return (
            <Image
              key={actualKey}
              width={200}
              height={200}
              src="https://webcolours.ca/wp-content/uploads/2020/10/webcolours-unknown.png"
              onClick={() => {
                navigate('view?id=' + actualKey, {
                  state: { dashboard: publishedDashboards[key] },
                });
              }}
            />
          );
        })}
      </Image.PreviewGroup>
    </div>
  );
};

export default withDataManager(HomeView);
