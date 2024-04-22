import React from "react";
import {createUUID, getDrafts, setDraft} from "../components/drafts/DraftUtils";
import {notification} from "antd";
import {DashboardModel} from "@future-sight/common";
import {Link} from "react-router-dom";

const withDraftManager = (Component) => {
    return class extends React.Component<any, any> {
        constructor(props) {
            super(props);
            this.state = {
                draftFromURL: ''
            }
        }

        setDraftFromURL = (newValue) => {
            this.setState({draftFromURL: newValue});
        }
        draftOnClick = async (id) => {
            if (id) {
                const dashboard = await this.props.dataManager.getDashboard(id);
                if (dashboard) {
                    const uuid = createUUID();
                    dashboard.id = uuid;
                    setDraft(uuid, dashboard);
                    window.location.href = 'draft?id=' + uuid;
                }
            } else {
                notification.error({
                    message: 'Could not find the dashboard',
                    description: 'Please check the url',
                });
            }
        };

        draftFromURLOnClick = () => {
            const parse = new URL(this.state.draftFromURL).searchParams.get('id');
            return this.draftOnClick(parse)
        }

        newDraft = () => {
            const uuid = createUUID();
            setDraft(uuid, DashboardModel.fromDraft(uuid));
            window.location.href = 'draft?id=' + uuid;
        };

        getDraftsElement = () => {
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

        render() {
            return <Component draftManager={{
                draftOnClick: this.draftOnClick,
                draftFromURLOnClick: this.draftFromURLOnClick,
                draftFromURL: this.state.draftFromURL,
                setDraftFromURL: this.setDraftFromURL,
                newDraft: this.newDraft,
                getDraftsElement: this.getDraftsElement
            }}
                              dataManager={this.props.dataManager}
            />
        }
    }
}

export default withDraftManager;