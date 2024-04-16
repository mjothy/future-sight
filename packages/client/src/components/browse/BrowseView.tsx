import React from 'react';
import { Form, Col, Row, Button, Alert, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './BrowseView.css';
import withDataManager from '../../services/withDataManager';
import withDraftManager from '../../services/withDraftManager';
import withForm from '../../services/withForm';
import PreviewGroup from '../PreviewGroup';

const { Option } = Select;

class BrowseView extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dashboards: {},
      submitDisabled: true,
      data: null,
      memo: new Map<number, any>(), // cache to avoid re-fetching already fetched dashboards
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
      .filter((key) => values[key] && values[key].length > 0)
      .reduce((obj, key) => Object.assign(obj, { [key]: values[key] }), {});
    return Object.keys(inputs).length > 0;
  };

  onFormValuesChange = (_, values) => {
    const state = {} as any;
    state.submitDisabled = !this.checkValues(values);
    this.setState(state);
  };

  /**
   * Update the "globalSet" with the list of dashboards linked to the "value" selected by the user
   * @param globalSet the global list to update
   * @param value the input value (e.g. authors, tags, ...)
   * @param key the key to find the dashboards in the state.data
   */
  updateGlobalSet = (globalSet, value, key) => {
    if (value && value.length > 0) {
      const selected = new Set<number>();
      value.forEach((e) => {
        /**
         * globalData[key][e] contains the list of dashboards linked with "e"
         * e (may be the author, the tag, etc. according to the "key")
         */
        this.state.data[key][e].forEach((dashboard) => {
          selected.add(dashboard);
        });
      });
      globalSet.push([...selected]);
    }
  };

  browseDashboards = (values) => {
    this.setState({ loading: true }, async () => {
      const { authors, tags } = values;
      const { memo } = this.state;

      /**
       * A list of non empty lists of dashboard ids.
       * It contains all the dashboards selected by each filter.
       */
      const globalSet: Array<Array<number>> = [];
      // For each filters, update globalSet with the selected dashboards
      this.updateGlobalSet(globalSet, authors, 'authors');
      this.updateGlobalSet(globalSet, tags, 'tags');

      // Intersection of all the filters
      const dashboards = globalSet.reduce((a, b) =>
        a.filter((c) => b.includes(c))
      );

      // Fetch missing dashboard from the memo
      const dashboardsToFetch = [...dashboards].filter((id) => !memo.has(id));
      if (dashboardsToFetch.length > 0) {
        const results = await this.props.dataManager.browseData({
          dashboards: dashboardsToFetch,
        });
        Object.entries(results).forEach(([key, val]) => {
          const id = typeof key === 'string' ? parseInt(key) : key;
          memo.set(id, val);
        });
      }

      // Get the dashboards to display from the memo
      const results = {};
      [...dashboards].forEach((id) => {
        results[id] = memo.get(id);
      });
      this.setState({ loading: false, dashboards: results });
    });
  };

  render() {
    const { dashboards, loading, submitDisabled, data } = this.state;
    return (
      <>
        <div className="browse-container">
          <h2>Browse a dashboard</h2>
          <Form
            className="form"
            onValuesChange={this.onFormValuesChange}
            onFinish={this.browseDashboards}
            form={this.props.form}
          >
            <Row justify="space-around">
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
                    message="You need to fill in at least one input to search for dashboards"
                    type="warning"
                    className="warning"
                  />
                </div>
              )}
            </div>
          </Form>
        </div>
        <div className="search-result">
          {Object.keys(dashboards).length > 0 && (
            <PreviewGroup dashboards={Object.values(dashboards)}
                          urlPrefix={'/view?id='} draftOnClick={this.props.draftManager.draftOnClick}
                          dataManager={this.props.dataManager}/>
          )}
        </div>
      </>
    );
  }
}

export default withForm(withDataManager(withDraftManager(BrowseView)));
