import React, { Component } from 'react';

export const GetGeoJsonContext = React.createContext({ getGeoJson: () => {/** */ } });

/**
 * Provide the GetGeoJson class to all children components using react context
 */
class GetGeoJsonContextProvider extends Component<any, any> {
  render() {
    return (
      <GetGeoJsonContext.Provider
        value={{ getGeoJson: this.props.getGeoJson }}
      >
        {this.props.children}
      </GetGeoJsonContext.Provider>
    );
  }
}

export default GetGeoJsonContextProvider;
