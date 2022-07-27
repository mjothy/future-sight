import React from 'react'

// Make the datamanager(endpoints) accessible using to other component using HOC

export default function DataManager(Component) {
  return class extends React.Component<any, any> {

    constructor(props) {
      super(props);
      this.state = {
        data: {}
      }
    }
    fetchData = (data) => {
      
      return fetch('http://localhost:8080/api/data',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,

      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

    fetchModels = () => {
      return fetch('http://localhost:8080/api/models')
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

    fetchVariables = (data) => {
      return fetch(`http://localhost:8080/api/variables?model=${data.model}&scenario=${data.scenario}`)
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch(err => err);
    }

    fetchRegions = (data) => {
      return fetch(`http://localhost:8080/api/regions?model=${data.model}&scenario=${data.scenario}&variable=${data.variable}`)
        .then((response) => response.json())
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