import React, {Component} from 'react';
import {ColorizerContext} from "./ColorizerProvider";

/*
    Injects a color picker tool props to given component
 */
export default function withColorizer(ComponentToExtend) {
    return class colorizerHOC extends Component<any> {
        render() {
            return (
                <ColorizerContext.Consumer>
                    {(state) => <ComponentToExtend {...this.props} colorizer={state} />}
                </ColorizerContext.Consumer>
            )
        }
    };
}