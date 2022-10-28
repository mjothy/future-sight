import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { Component } from 'react';

interface DataType {
  key: React.Key;
  model: string;
  scenario: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Model',
    dataIndex: 'model',
  },
  {
    title: 'Scenario',
    dataIndex: 'scenario',
  },
];

export default class DataBlockTableSelection extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  extractSelectedRowKeys() {
    const data = this.getSelectedData()
    const selectedRowKeys: React.Key[] = [];
    Object.keys(data).map((modelKey) => {
      data[modelKey].map((scenario) =>
        selectedRowKeys.push(modelKey + '/' + scenario)
      );
    });
    return selectedRowKeys;
  }

  onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    const models: { [id: string]: string[] } = {};
    selectedRows.map((row) => {
      const model = row.model
      const scenario = row.scenario
      if (models[model] == null) models[model] = [];
      models[model].push(scenario);
    });
    this.props.onSelectChange(models);
  };

  getSelectedBlock = () => {
    return this.props.dashboard.blocks[this.props.blockSelectedId]
  }

  getSelectedData = () => {
    return this.getSelectedBlock().config.metaData.models;
  }

  getTableData = () => {
    const data: DataType[] = [];
    const { dataStructure } = this.props.dashboard;
    if (dataStructure != null) {
      Object.keys(dataStructure).map((modelKey) => {
        Object.keys(dataStructure[modelKey]).map((scenarioKey) => {
          data.push({
            key: modelKey + '/' + scenarioKey,
            model: modelKey,
            scenario: scenarioKey,
          });
        });
      });
    }
    return data;
  }

  render() {
    return (
      <Table
        rowSelection={{
          selectedRowKeys: this.extractSelectedRowKeys(),
          onChange: this.onSelectChange,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        }}
        columns={columns}
        dataSource={this.getTableData()}
      />
    );
  }
}
