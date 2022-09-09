import React from 'react';
import {Col, Image, Row} from 'antd';
import './DraftsView.css';
import Preview from "../Preview";
import {getDrafts} from "./DraftUtils";

export default class DraftsView extends React.Component<any, any> {
    objectMap = (obj, fn) => {
        const ret = Object.fromEntries(
            Object.entries(obj).map(
                ([k, v], i) => [k, fn(k, v, i)]
            )
        );
        return Object.values(ret);
    }

    renderPreviews = () => {
        const ret: JSX.Element[] = []
        const drafts = getDrafts();
        let i = 1
        let bucket: JSX.Element[] = []
        for (const [key, value] of Object.entries(drafts)) {
            bucket.push(
                <Col>
                    <Preview key={i} id={key} conf={value}/>
                </Col>
            )
            if(i % 6 === 0) {
                ret.push(
                    <Row>
                        {bucket}
                    </Row>
                )
                bucket = []
            }
            i++
        }
        if(bucket.length > 0) {
            ret.push(
                <Row>
                    {bucket}
                </Row>
            )
        }
        return ret;
    }

    render() {
        return (
            <div className="drafts-view-wrapper">
                <h2>Your drafts</h2>
                <div className="drafts-container">
                    <div className="drafts-wrapper">
                        <Image.PreviewGroup>
                            {this.renderPreviews()}
                        </Image.PreviewGroup>
                    </div>
                </div>
            </div>
        );
    }
}
