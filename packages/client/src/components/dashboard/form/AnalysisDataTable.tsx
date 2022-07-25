/* eslint-disable react/jsx-key */
import { Table } from 'antd'
import { Component } from 'react'

// To save the selected data
// INPUT: Models and scenarios
// Output:
export default class AnalysisDataTable extends Component<any, any> {
  columns;

  constructor(props) {
    super(props)
    console.log("props table: ", props);

    this.state = {
      models: this.props.models
    }

    /**
     * return the table columns
     */
    this.columns = this.setColumns();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.models !== prevProps.models) {
      this.setState({ models: this.props.models })
      this.columns = this.setColumns();


    }
  }

  /**
   * return the table datasource
   * @returns {*}
   */
  data = () => {
    if (this.props.models.length >= 0) {
      return this.state.models
    } else return []
  }

  /**
   * Set table columns
   */
  setColumns = () => {
    const columns = [{
      title: 'Model',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Scenario',
      dataIndex: 'scenarios',
      key: 'name',
      render: (scenarios) => scenarios.map(scenario => <p>{scenario.name}</p>)

    }
    ]

    return columns;
  }


  render() {
    return (
      <Table className='width-60' dataSource={this.data()} columns={this.columns} />
    )
  }
}
