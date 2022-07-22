/* eslint-disable react/jsx-key */
import { Table } from 'antd'
import { Component } from 'react'

// To save the selected data
// INPUT: Models and scenarios
// Output:
export default class AnalysisDataTable extends Component<any, any> {
  columns;

  constructor(props){
    super(props)
    console.log("props table: ", props);

    this.state = {
      models: this.props.models
    }

    /**
     * return the table columns
     */
   this.columns = [{
      title: 'Model',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Scenario',
      dataIndex: 'scenarios',
      key: 'name',
      render: (scenarios) => scenarios.map(scenario => <p>{scenario.name}</p> )

    }
  ]
  }

  componentDidUpdate(prevProps, prevState, snapshot)
{
  if(this.props !== prevProps){
    this.setState({models: this.props.models})
  }
}

  /**
   * return the table datasource
   * @returns {*}
   */
  data = () =>{
    console.log("outside here: ", this.props.models);

    if(this.props.models.length >= 0){
      console.log("enter here: ", this.props.models);
      return this.state.models
    }else return []
  }

 

  render() {
    console.log("models: ",this.props.models)
    return (
    <Table className='width-60' dataSource={this.data()} columns={this.columns} />
    )
  }
}
