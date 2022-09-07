/* eslint-disable react/prop-types */
import React from 'react';
import DataManager from './DataManager';
import { DataManagerContext } from './DataManagerContextProvider';

export default function withDataManager(Component) {
  class withDataManager extends React.Component<any, any> {
    static displayName: string;
    render() {
      return (
        <DataManagerContext.Consumer>
          {(context) => {
            return (
              <Component {...this.props} dataManager={context.dataManager} />
            );
          }}
        </DataManagerContext.Consumer>
      );
    }
  }

  const name = Component.displayName || Component.name;
  withDataManager.displayName = `withDataManager(${name})`;
  return withDataManager;
}
