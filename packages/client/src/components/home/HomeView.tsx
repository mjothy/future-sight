import React, {useEffect, useState} from 'react';
import {Button, Input, Divider} from 'antd';
import withDataManager from '../../services/withDataManager';
import type {ComponentPropsWithDataManager} from '@future-sight/common';
import './HomeView.css';
import Footer from '../footer/Footer';
import PreviewGroup from '../PreviewGroup';
import Logo from "../navbar/Logo";
import withDraftManager from "../../services/withDraftManager";
import {Content} from "antd/lib/layout/layout";

const HomeView: React.FC<ComponentPropsWithDataManager> = ({dataManager, draftManager}) => {
    const [publishedDashboards, setPublishedDashboards] = useState({});

    useEffect(() => {
        dataManager.getDashboards().then(setPublishedDashboards);
    }, []);


    return (
        <>
            <div className="home-view-wrapper">
                <Content>
                <div className={"home-header"}>
                    <div className="home-logo">
                        <Logo/>
                    </div>
                    <span><i>The ECEMF data visualization tool</i></span>
                </div>

                <div className="create-container">
                    <div className="drafts">
                        <Button type="primary" onClick={draftManager.newDraft}>
                            Create a new Dashboard
                        </Button>
                        {draftManager.getDraftsElement()}
                    </div>
                </div>
                <div className="create-container">
                    <Input.Group style={{display: 'flex', flexDirection: 'row'}}>
                        <Button
                            type="primary"
                            disabled={!draftManager.draftFromURL}
                            onClick={draftManager.draftFromURLOnClick}
                        >
                            Start from another Dashboard
                        </Button>
                        <Input
                            placeholder="https://..."
                            value={draftManager.draftFromURL}
                            onChange={(e) => draftManager.setDraftFromURL(e.target.value)}
                        />
                    </Input.Group>
                </div>
                    <Divider/>
                {publishedDashboards && Object.keys(publishedDashboards).length > 0 && (
                    <>
                        <h3>Latest submissions</h3>
                        <div className="previews-container">
                            <PreviewGroup
                                dashboards={publishedDashboards}
                                urlPrefix={'/view?id='}
                                draftOnClick={draftManager.draftOnClick}
                            />
                        </div>
                    </>
                )}
                </Content>
            </div>
            <Footer/>
        </>
    );
};

export default withDataManager(withDraftManager(HomeView));
