import React from 'react'

// Make the datamanager(endpoints) accessible using to other component using HOC

export default function DataManager(Component) {
  return class extends React.Component<any,any> {
    
    constructor(props){
      super(props);
      this.state = {
          data: {}
      }
    }
    fetchData = () =>  {
      return fetch('http://localhost:8080/api/data')
      .then((response)=>response.json())
      .then((data) => {
        return data;
      })
      .catch(err => err);
    }

    fetchScenarios = (model) =>  {
      return fetch(`http://localhost:8080/api/scenarios?model=${model}`)
      .then((response)=>response.json())
      .then((data) => {
        return data;
      })
      .catch(err => err);
    }

    fetchModels = () =>  {
      return fetch('http://localhost:8080/api/models')
      .then((response)=>response.json())
      .then((data) => {
        return data;
      })
      .catch(err => err);
    }

    render() {
      return (
        <Component dataManager={this} {...this.props} />
      )
    }
  }
}