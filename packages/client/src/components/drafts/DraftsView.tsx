import React from 'react';
import {Image} from 'antd';
import './DraftsView.css';
import Preview from "../Preview";
import {getDrafts} from "./DraftUtils";

export default class DraftsView extends React.Component<any, any> {
    objectMap = (obj, fn) => {
        return Object.fromEntries(
            Object.entries(obj).map(
                ([k, v], i) => [k, fn(v, k, i)]
            )
        )
    }

    render() {
        return (
            <div className="drafts-view-wrapper">
                <h2>Your drafts</h2>
                <div className="drafts-container">
                    <div className="drafts-wrapper">
                        <Image.PreviewGroup>
                            {this.objectMap(getDrafts(), (key, value, i) => (
                                <Preview key={key} id={key} conf={value}/>
                            ))}
                        </Image.PreviewGroup>
                    </div>
                </div>
            </div>
        );
    }
}
