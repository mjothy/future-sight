import { Table } from 'antd'
import { Component } from 'react'

export default class AnalysisDataTable extends Component<any, any> {
  columns;

  constructor(props) {
    super(props)
    this.state = {
      dataSource: []
    }

    /**
     * return the table columns
     */
    this.columns = this.setColumns();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const data = this.props.structureData;
    if (this.props.structureData !== prevProps.structureData) {
      const dataSource: any[] = [];

      Object.keys(data).map(key => {
        const dataObject = {
          model: "",
          scenarios: new Array<string>()
        }
        dataObject.model = key;
        const scenarios: string[] = Object.keys(data[key]);
        dataObject.scenarios.push(...scenarios);

        dataSource.push(dataObject);
      })
      this.setState({ dataSource })
      this.columns = this.setColumns();
    }
  }

  /**
   * return the table datasource
   * @returns {*}
   */
  dataSource = () => {
    return this.state.dataSource
  }

  /**
   * Set table columns
   */
  setColumns = () => {
    const columns = [{
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Scenario',
      dataIndex: 'scenarios',
      key: 'scenarios',
      render: (scenarios) => scenarios.map(scenario => <p key={scenario}>{scenario}</p>)

    }
    ]
    return columns;
  }

  render() {
    return (
      <Table className='width-60' dataSource={this.dataSource()} columns={this.columns} />
    )
  }
}