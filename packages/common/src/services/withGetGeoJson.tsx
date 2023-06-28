/* eslint-disable react/prop-types */
import React from 'react';
import { GetGeoJsonContext } from './GetGeoJsonContextProvider';

export default function withGetGeoJson(Component) {
    let component = class withGetGeoJson extends React.Component<any, any> {
        static displayName: string;
        render() {
            return (
                <GetGeoJsonContext.Consumer>
                    {(context) => {
                        return (
                            <Component {...this.props} getGeoJson={context.getGeoJson} />
                        );
                    }}
                </GetGeoJsonContext.Consumer>
            );
        }
    }

    const name = Component.displayName || Component.name;
    component.displayName = `withGetGeoJson(${name})`;
    return component;
}
