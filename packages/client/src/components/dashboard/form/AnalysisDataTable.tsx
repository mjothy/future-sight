import { DeleteOutlined } from '@ant-design/icons';
import {Button, Popconfirm, Table } from 'antd';
import { Component } from 'react';

/**
 * To show all meta data selected to work with in the dashboard
 */
export default class AnalysisDataTable extends Component<any, any> {

  constructor(props) {
    super(props);
  }

  /**
   * Transform the dataStructure selected in comboBox into representable data (data that antd table can handle)
   */
  prepareDataSource = () => {
    const data = this.props.dataStructure;

    if (data != null) {
      const dataSource: any[] = [];

      Object.keys(data).map((key, idx) => {
        const dataObject = {
          key: idx,
          model: '',
          scenarios: new Array<string>(),
        };
        dataObject.model = key;
        const scenarios: string[] = Object.keys(data[key]);
        dataObject.scenarios.push(...scenarios);

        dataSource.push(dataObject);
      });
      return dataSource;
    }
    return undefined;
  }

  /**
   * Set table columns
   */
  columns = () => {
    return [
      {
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
      },
      {
        title: 'Scenario',
        dataIndex: 'scenarios',
        key: 'scenarios',
        render: (scenarios) =>
          scenarios.map((scenario) => <p key={scenario}>{scenario}</p>),
      },
      {
        title: 'Action',
        key: 'Action',
        render: (_, record) => (
            <Popconfirm
                title="Deleting this model will delete ALL blocks that use it, continue ?"
                onConfirm={() => this.props.deleteRow(record)}
                okText="Yes"
                cancelText="No"
                key={record.model}
            >
              <Button icon={<DeleteOutlined />}/>
            </Popconfirm>
        ),
      },
    ];
  };

  render() {
    return (
      <Table
        className="width-60"
        dataSource={this.prepareDataSource()}
        columns={this.columns()}
      />
    );
  }
}
