/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import withDataManager from './withDataManager';

export const DataManagerContext = React.createContext({});

/**
 * Provide the dataManager class to all children components using react context
 */
class DataManagerContextProvider extends Component<any, any> {
    render() {
        return (
            // this.props.dataManager: comes from the HOC withDataManager
            <DataManagerContext.Provider value={{ dataManager: this.props.dataManager }} >
                {this.props.children}
            </DataManagerContext.Provider>
        )
    }
}

export default withDataManager(DataManagerContextProvider);
