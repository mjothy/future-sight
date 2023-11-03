import React from "react";
import FutureLogo from "../../assets/images/logo-light.png";
import FutureLogoDark from "../../assets/images/logo-dark.png";

export default class Logo extends React.Component<any, any> {
    render() {
        return <div className={"logo" + (this.props.light ? " logo-light" : "")}>
            <h2>Future</h2>
            <img src={this.props.light ? FutureLogo : FutureLogoDark} alt="Logo" />
            <h2>Sight</h2>
        </div>
    }
}
