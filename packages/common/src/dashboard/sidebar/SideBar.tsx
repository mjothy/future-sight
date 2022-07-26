import {
  LeftCircleFilled
} from '@ant-design/icons';
import { Button, Row, Col } from 'antd';
import React, { Component } from 'react';

export default class SideBar extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    }
  }

  showActions = () => {
    this.setState({ formVisible: false })
  }
  formAddBlock = (type) => {
    this.setState({ formVisible: true, type })
  }
  render() {
    return (
        <div>
          <Row justify="start">
            <Col span={4}>
              <Button type="primary" onClick={() => this.props.handleSubmit(false)} className="bg-primary">
                <LeftCircleFilled />
              </Button>
            </Col>
          </Row>
          <Row>
            {this.props.children}
          </Row>
        </div>
        
    )
  }
}
