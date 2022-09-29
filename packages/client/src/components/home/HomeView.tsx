import React, { useEffect, useState } from 'react';
import { Button, Input, Divider, Image, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import withDataManager from '../../services/withDataManager';
import {
  ComponentPropsWithDataManager,
  DashboardModel,
} from '@future-sight/common';
import './HomeView.css';
import { createUUID, getDrafts, setDraft } from '../drafts/DraftUtils';
import Footer from '../footer/Footer';
import PreviewGroup from "../PreviewGroup";

const HomeView: React.FC<ComponentPropsWithDataManager> = ({ dataManager }) => {
  const [draftFromURL, setDraftFromURL] = useState('');
  const [publishedDashboards, setPublishedDashboards] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the last char, which is the dot added by the backend
    // (see the GET /api/dashboards response)
    dataManager.getDashboards().then((dashboards) => {
      const parsedDashboards = {}
      for(const old_key of Object.keys(dashboards)) {
        parsedDashboards[old_key.slice(0,-1)] = dashboards[old_key]
      }
      setPublishedDashboards(parsedDashboards)
    });
  }, []);

  const getDraftsElement = () => {
    const drafts = getDrafts();
    if (Object.keys(drafts).length > 1) {
      return <Link to="drafts">Continue from a draft</Link>;
    } else if (Object.keys(drafts).length === 1) {
      const url = `draft?id=${Object.keys(drafts)[0]}`;
      return <Link to={url}>Continue from the last draft</Link>;
    } else {
      return null;
    }
  };

  const draftFromURLOnClick = () => {
    const parse = new URL(draftFromURL).searchParams.get('id');
    if (parse) {
      if (parse in publishedDashboards) {
        const uuid = createUUID();
        setDraft(uuid, publishedDashboards[parse]);
        navigate('draft?id=' + uuid);
      }
    } else {
      notification.error({
        message: 'Could not find the dashboard',
        description: 'Please check the url',
      });
    }
  };

  const newDraft = () => {
    const uuid = createUUID();
    setDraft(uuid, DashboardModel.fromDraft(uuid));
    navigate('draft?id=' + uuid);
  };

  return (
    <>
      <div className="home-view-wrapper">
        <h2>Welcome to FutureSight!</h2>
        <div className="create-container">
          <div className="drafts">
            <Button type="primary" onClick={newDraft}>
              Create a new Dashboard
            </Button>
            {getDraftsElement()}
          </div>
          <Input.Group style={{ display: 'flex', flexDirection: 'row' }}>
            <Button
              type="primary"
              disabled={!draftFromURL}
              onClick={draftFromURLOnClick}
            >
              Start from another Dashboard
            </Button>
            <Input
              placeholder="https://..."
              value={draftFromURL}
              onChange={(e) => setDraftFromURL(e.target.value)}
            />
          </Input.Group>
        </div>
        {publishedDashboards && Object.keys(publishedDashboards).length > 0 && (
          <>
            <Divider />
            <h3>Latest submissions</h3>
            <div className="previews-container">
              <PreviewGroup dashboards={publishedDashboards} urlPrefix={'/view?id='} />
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default withDataManager(HomeView);
