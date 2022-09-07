import React, { Component } from 'react'
import Navbar from "./Navbar";
import Routing from './Routing';

class AppComponent extends Component {

    render() {
        return (
            <>
                <Navbar/>
                <Routing/>
            </>)
    }
}

export default AppComponent;
