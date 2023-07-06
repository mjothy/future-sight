import React, {Component} from "react";
import {Spin} from "antd";
import './loaderMask.css';

export default class LoaderMask extends Component<any, any> {
    render() {
        if(this.props.loading) {
            return (
                <div className="loaderMask" >
                    <Spin/>
                </div>
            )
        }
        return null
    }
}
