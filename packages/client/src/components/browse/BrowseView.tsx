import React from 'react';
import { Form, Input, Col, Row, Button, Alert, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './BrowseView.css';
import withDataManager from '../../services/withDataManager';
import withForm from '../../services/withForm';

const { Option } = Select;

class BrowseView extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dashboards: {},
      submitDisabled: true,
      data: null,
      selectedModel: undefined,
    };
  }

  componentDidMount(): void {
    this.fetchInitData();
  }

  fetchInitData = async () => {
    try {
      const data = await this.props.dataManager.fetchBrowseInitData();
      this.setState({ data });
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Check the validity of the form
   * @param values the form's values
   * @returns whether the form is valid or not
   */
  checkValues = (values) => {
    const inputs = Object.keys(values)
      .filter((key) => !!values[key])
      .reduce((obj, key) => Object.assign(obj, { [key]: values[key] }), {});
    if (inputs['model']) {
      return inputs['scenarios'] && inputs['scenarios'].length > 0;
    }
    return Object.keys(inputs).length > 0;
  };

  onFormValuesChange = (changedValue, values) => {
    const state = {} as any;
    // reset scenario input if the model input has been cleared
    if (!values.model) {
      this.props.form.setFieldsValue({ scenarios: [] });
      values.scenarios = undefined;
    }
    state.submitDisabled = !this.checkValues(values);
    this.setState(state);
  };

  browseDashboards = (values) => {
    this.setState({ loading: true }, async () => {
      const { authors, model, scenarios, tags, title } = values;
      const { data } = this.state;
      const dashboards = new Set();
      authors.forEach((author) => {
        // data.authors[author] contains the list of dashboards created by the "author"
        data.authors[author].forEach((dashboard) => {
          dashboards.add(dashboard);
        });
      });
      tags.forEach((tag) => {
        // data.tags[tag] contains the list of dashboards tagged with the "tag"
        data.tags[tag].forEach((dashboard) => {
          dashboards.add(dashboard);
        });
      });

      const results = await this.props.dataManager.browseData({
        dashboards: [...dashboards],
        model,
        scenarios,
        title,
      });
      this.setState({ loading: false, dashboards: results });
    });
  };

  render() {
    const { dashboards, loading, submitDisabled, data, selectedModel } =
      this.state;
    return (
      <div className="browse-container">
        <h2>Browse a dashboard</h2>
        <div className="form-container">
          <Form
            className="form"
            onValuesChange={this.onFormValuesChange}
            onFinish={this.browseDashboards}
            form={this.props.form}
          >
            <Row justify="space-around">
              <Col span={7}>
                <Form.Item name="title" label="Title">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="authors" label="Authors">
                  <Select
                    mode="multiple"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {data &&
                      Object.keys(data.authors).map((author, i) => (
                        <Option key={i} value={author}>
                          {author}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="tags" label="Tags">
                  <Select
                    mode="multiple"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {data &&
                      Object.keys(data.tags).map((tag, i) => (
                        <Option key={i} value={tag}>
                          {tag}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row justify="space-around">
              <Col span={11}>
                <Form.Item name="model" label="Model">
                  <Select
                    showSearch
                    optionFilterProp="children"
                    onChange={(e) => this.setState({ selectedModel: e })}
                    allowClear
                  >
                    {data &&
                      Object.keys(data.models).map((model, i) => (
                        <Option key={i} value={model}>
                          {model}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item name="scenarios" label="Scenarios">
                  <Select
                    mode="multiple"
                    showSearch
                    optionFilterProp="children"
                    disabled={!selectedModel}
                    allowClear
                  >
                    {data &&
                      selectedModel &&
                      Object.keys(data.models[selectedModel]).map(
                        (scenario, i) => (
                          <Option key={i} value={scenario}>
                            {scenario}
                          </Option>
                        )
                      )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="submit-container">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                disabled={submitDisabled}
                loading={loading}
              >
                Browse
              </Button>
              {submitDisabled && (
                <div className="warning-container">
                  <Alert
                    message="You need to fill in at least one input and/or select a model and a scenario to browse a dashboard"
                    type="warning"
                    className="warning"
                  />
                </div>
              )}
            </div>
          </Form>
          <div className="search-result">
            {Object.keys(dashboards).length > 0 &&
              Object.keys(dashboards).map((e) => {
                e;
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default withForm(withDataManager(BrowseView));
