import React from 'react';
import { Form, Input, Col, Row, Spin, Button, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './BrowseView.css';

export default class DraftsView extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dashboards: [],
      submitDisabled: true,
    };
  }

  componentDidMount(): void {
    this.fetchInitData();
  }

  fetchInitData = () => {
    return 'test';
  };

  /**
   * Check that a least one field is defined
   * @param values the form's values
   * @returns whether there's a field that is defined or not
   */
  checkValues = (values) => {
    return Object.values(values).find((val) => !!val);
  };

  onFormValuesChange = (values) => {
    if (this.checkValues(values)) {
      this.setState({ submitDisabled: false });
    } else {
      this.setState({ submitDisabled: true });
    }
  };

  render() {
    const { dashboards, loading, submitDisabled } = this.state;
    return (
      <div className="browse-container">
        <h2>Browse a dashboard</h2>
        <div className="form-container">
          <Form className="form" onValuesChange={this.onFormValuesChange}>
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
            <div className="submit-container">
              {submitDisabled && (
                <Alert
                  message="You need to fill at least one input to browse a dashboard"
                  type="warning"
                  style={{ marginBottom: 10 }}
                />
              )}
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                disabled={submitDisabled}
              >
                Browse
              </Button>
            </div>
          </Form>
          <div className="search-result">
            {loading && <Spin />}
            {dashboards.length > 0 &&
              dashboards.map((e) => {
                e;
              })}
          </div>
        </div>
      </div>
    );
  }
}
