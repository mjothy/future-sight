import React, { Component } from 'react'
import ControlBlockView from './ControlBlockView';
import DataBlockView from './DataBlockView';
import TextBlockView from './TextBlockView';

// Responsability choise the block

export default class BlockViewManager extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    blockByType = () => {
        const type = this.props.type;
        switch (type) {
            case "data":
                return <DataBlockView {...this.props} />
            case "text":
                return <TextBlockView {...this.props} />
            case "control":
                return <ControlBlockView {...this.props} />
        }
    }
    render() {
        return this.blockByType()
    }
}
