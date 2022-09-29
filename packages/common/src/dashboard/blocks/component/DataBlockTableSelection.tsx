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
  data: DataType[] = [];
  selectedData: { [id: string]: string[] } = {};
  constructor(props) {
    super(props);
    this.selectedData =
      this.props.dashboard.blocks[
        this.props.blockSelectedId
      ].config.metaData.models;
    this.prepareDataTable();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.blockSelectedId !== this.props.blockSelectedId &&
      this.props.blockSelectedId != ''
    ) {
      this.selectedData =
        this.props.dashboard.blocks[
          this.props.blockSelectedId
        ].config.metaData.models;
    }
  }

  extractSelectedRowKeys(data) {
    const selectedRowKeys: React.Key[] = [];
    Object.keys(data).map((modelKey) => {
      data[modelKey].map((scenario) =>
        selectedRowKeys.push(modelKey + '/' + scenario)
      );
    });
    return selectedRowKeys;
  }

  /**
   *Prepare the table source data
   *The key table is: model/scenario
   */
  prepareDataTable() {
    const { dataStructure } = this.props.dashboard;
    if (dataStructure != null) {
      Object.keys(dataStructure).map((modelKey) => {
        Object.keys(dataStructure[modelKey]).map((scenarioKey) => {
          this.data.push({
            key: modelKey + '/' + scenarioKey,
            model: modelKey,
            scenario: scenarioKey,
          });
        });
      });
    }
  }

  onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    const models: { [id: string]: string[] } = {};
    newSelectedRowKeys.map((row) => {
      const modelScenario = row.toString().split('/');
      if (models[modelScenario[0]] == null) models[modelScenario[0]] = [];

      models[modelScenario[0]].push(modelScenario[1]);
    });
    this.props.updateBlockMetaData({ models });
    // Update the selected data variable
    this.selectedData =
      this.props.dashboard.blocks[
        this.props.blockSelectedId
      ].config.metaData.models;

    if (
      this.props.dashboard.blocks[this.props.blockSelectedId].blockType ===
      'data'
    )
      this.props.updateDropdownData();
  };

  render() {
    return (
      <Table
        rowSelection={{
          selectedRowKeys: this.extractSelectedRowKeys(this.selectedData),
          onChange: this.onSelectChange,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        }}
        columns={columns}
        dataSource={this.data}
      />
    );
  }
}
