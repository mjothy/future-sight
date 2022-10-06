import React from 'react';
import {Col, Row, Space} from 'antd';
import Preview from "./Preview";

import "./PreviewGroup.css"

export default class PreviewGroup extends React.Component<any, any> {
    render() {
        const ret: JSX.Element[] = []
        let i = 1
        let bucket: JSX.Element[] = []
        for (const [key, value] of Object.entries(this.props.dashboards)) {
            bucket.push(
                <Col key={i}>
                    <Preview key={key} id={key} conf={value} urlPrefix={this.props.urlPrefix}/>
                </Col>
            )
            if(i % 6 === 0) {
                ret.push(<Row key={i} style={{marginBottom: 8}}><Space>{bucket}</Space></Row>)
                bucket = []
            }
            i++
        }
        if(bucket.length > 0) {
            ret.push(<Row key={i}><Space>{bucket}</Space></Row>)
        }
        return <div className={"preview-group"}>{ret}</div>
    }
}
