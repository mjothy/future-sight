/* eslint-disable react/prop-types */
import React from 'react'
import DataManager from './DataManager';
const dataManager = new DataManager();

export default function withDataManager(Component) {
    class withDataManager extends React.Component {
        static displayName: string;
        render(){
            return <Component {...this.props} dataManager = {dataManager} />
        }
    }

    const name = Component.displayName || Component.name;
    withDataManager.displayName = `withDataManager(${name})`;
    return withDataManager;
}