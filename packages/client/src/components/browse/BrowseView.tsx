import React from 'react';
import { Form, Input, Col, Row, Spin } from 'antd';
import './BrowseView.css';

export default class DraftsView extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="browse-container">
        <h2>Browse a dashboard</h2>
        <div>
          <Form className="form">
            <Row justify="space-around" align="middle">
              <Col span={7}>
                <Form.Item name="title" label="Title">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="author" label="Author">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="tags" label="Tags">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="space-around" align="middle">
              <Col span={11}>
                <Form.Item name="model" label="Model">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item name="scenario" label="Scenario">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className="search-result">
            <Spin />
          </div>
        </div>
      </div>
    );
  }
}
