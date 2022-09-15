import React from 'react';
import {Col, Image, Row} from 'antd';
import './DraftsView.css';
import Preview from "../Preview";
import {getDrafts} from "./DraftUtils";
import PreviewGroup from "../PreviewGroup";

export default class DraftsView extends React.Component<any, any> {
    objectMap = (obj, fn) => {
        const ret = Object.fromEntries(
            Object.entries(obj).map(
                ([k, v], i) => [k, fn(k, v, i)]
            )
        );
        return Object.values(ret);
    }

    render() {
        return (
            <div className="drafts-view-wrapper">
                <h2>Your drafts</h2>
                <div className="drafts-container">
                    <div className="drafts-wrapper">
                        <PreviewGroup dashboards={getDrafts()} urlPrefix={'/draft?id='} />
                    </div>
                </div>
            </div>
        );
    }
}
