import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'antd/es/table/interface';
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
export default class ControlBlockTableSelection extends Component<any, any> {
    data: DataType[] = [];
    selectedData: { [id: string]: string[] } = {};
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        this.selectedData = this.props.currentBlock.config.metaData.master['models'].values;
        this.prepareDataTable();
    }

    componentDidMount() {
        this.prepareDataTable();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.models !== this.props.models) {
            this.prepareDataTable();
        }
    }

    extractSelectedRowKeys(data) {
        console.log("data: ", data);
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
        const models = this.props.models;
        console.log("call and models: ", this.props.models);
        const data : any= [];
        if (models != null) {
            Object.keys(models).map((modelKey) => {
                models[modelKey].map((scenarioKey) => {
                    data.push({
                        key: modelKey + '/' + scenarioKey,
                        model: modelKey,
                        scenario: scenarioKey,
                    });
                });
            });
        }

        this.setState({data})
    }

    onSelectChange = (newSelectedRowKeys: React.Key[]) => {
          const models: { [id: string]: string[] } = {};
          newSelectedRowKeys.map((row) => {
            const modelScenario = row.toString().split('/');
            if (models[modelScenario[0]] == null) models[modelScenario[0]] = [];

            models[modelScenario[0]].push(modelScenario[1]);
          });
          const metaData = this.props.currentBlock.config.metaData;
          metaData.master['models'].values = models;
          console.log("metaData.master['models']: ", metaData.master['models']);
          this.props.updateBlockMetaData({ master: metaData.master }, this.props.currentBlock.id);
          // Update the selected data variable
          this.selectedData = this.props.currentBlock.config.metaData.master['models'].values;

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
                dataSource={this.state.data}
            />
        );
    }
}
