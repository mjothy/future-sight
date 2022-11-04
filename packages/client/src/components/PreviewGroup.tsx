import React from 'react';
import { Col, Row, Space } from 'antd';
import Preview from "./Preview";

import "./PreviewGroup.css"
import { DashboardModel } from '@future-sight/common';

export default class PreviewGroup extends React.Component<any, any> {
    render() {
        console.log("this.props.dashboards: ", this.props.dashboards);

        const ret: JSX.Element[] = []
        let i = 1
        let bucket: JSX.Element[] = []
        Object.values(this.props.dashboards).forEach((dashboard: DashboardModel | any) => {
            bucket.push(
                <Col key={i}>
                    <Preview key={dashboard.id} id={dashboard.id} conf={dashboard} urlPrefix={this.props.urlPrefix} />
                </Col>
            )
            if (i % 6 === 0) {
                ret.push(<Row key={i} style={{ marginBottom: 8 }}><Space>{bucket}</Space></Row>)
                bucket = []
            }
            i++
        });
        if (bucket.length > 0) {
            ret.push(<Row key={i}><Space>{bucket}</Space></Row>)
        }
        return <div className={"preview-group"}>{ret}</div>
    }
}
