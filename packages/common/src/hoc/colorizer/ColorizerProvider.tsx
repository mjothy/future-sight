import React, {Component} from "react";
import Colorizer from "./colorizer";

export const ColorizerContext = React.createContext<Colorizer | null>(null);

export default class ColorizerProvider extends Component<any> {
    constructor(props) {
        super(props);
    }

    render() {
        const colorizer = this.props.colorizer;

        return (
            <ColorizerContext.Provider value={colorizer}>
                {this.props.children}
            </ColorizerContext.Provider>
        )
    }
}
