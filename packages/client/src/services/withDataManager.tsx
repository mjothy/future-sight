/* eslint-disable react/prop-types */
import React from 'react'
import DataManager from './DataManager';
const dataManager = new DataManager();

export default function withDataManager(Component) {
    return class extends React.Component {
        render(){
            return <Component {...this.props} dataManager = {dataManager} />
        }
    }
}
