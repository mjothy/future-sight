import React, { useEffect, useState } from 'react';
import { Button, Input, Divider, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import withDataManager from '../../services/withDataManager';
import type {ComponentPropsWithDataManager} from '@future-sight/common';
import {DashboardModel} from "@future-sight/common";
import './HomeView.css';
import { createUUID, getDrafts, setDraft } from '../drafts/DraftUtils';
import Footer from '../footer/Footer';
import PreviewGroup from '../PreviewGroup';
import Logo from "../navbar/Logo";

const HomeView: React.FC<ComponentPropsWithDataManager> = ({ dataManager }) => {
  const [draftFromURL, setDraftFromURL] = useState('');
  const [publishedDashboards, setPublishedDashboards] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    dataManager.getDashboards().then(setPublishedDashboards);
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

  const draftOnClick = (id) => {
    if (id) {
      const dashboards = publishedDashboards as Array<DashboardModel | undefined>;
      const dashboard = dashboards.find((d: any) => d.id == id);
      if (dashboard) {
        const uuid = createUUID();
        dashboard.id = uuid;
        setDraft(uuid, dashboard);
        navigate('draft?id=' + uuid);
      }
    } else {
      notification.error({
        message: 'Could not find the dashboard',
        description: 'Please check the url',
      });
    }
  };

  const draftFromURLOnClick = () => {
    const parse = new URL(draftFromURL).searchParams.get('id');
    return draftOnClick(parse)
  }

  const newDraft = () => {
    const uuid = createUUID();
    setDraft(uuid, DashboardModel.fromDraft(uuid));
    navigate('draft?id=' + uuid);
  };

  return (
    <>
      <div className="home-view-wrapper">
        <div className="home-logo">
          <Logo/>
        </div>
        <span><i>The ECEMF data visualization tool</i></span>
        <div className="create-container">
          <div className="drafts">
            <Button type="primary" onClick={newDraft}>
              Create a new Dashboard
            </Button>
            {getDraftsElement()}
          </div>
        </div>
        <Divider />
        <div className="create-container">
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
            <h3>Latest submissions</h3>
            <div className="previews-container">
              <PreviewGroup
                dashboards={publishedDashboards}
                urlPrefix={'/view?id='}
                draftOnClick={draftOnClick}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default withDataManager(HomeView);
