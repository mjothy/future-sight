import React, { Component } from 'react'
import {
    LeftCircleFilled
} from '@ant-design/icons';
import { Button, Drawer, Space } from 'antd';
export default class Sidebar extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            placement: 'right',
            layouts: [],
            data: {},
            blockSelectedId: ""
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.visible !== prevProps.visible) {
            this.setState({ collapsed: this.props.visible })
        }
    }
    render() {
        const setVisibility = () => {
            this.setState({
                collapsed: !this.state.collapsed
            })
        }

        const setPlacement = (e) => {
            this.setState({ placement: e.currentTarget.value })
        }

        return (
            <Drawer
                placement={this.state.placement}
                width={500}
                visible={this.state.collapsed}
                onClose={setVisibility}
                maskClosable={true}
                mask={true}
                className={"drawer"}
                style={!this.state.collapsed ? { zIndex: '-1' } : { zIndex: '999' }}
                extra={
                    <Space>
                        <Button onClick={() => this.props.submitEvent(false)}>
                            <LeftCircleFilled />
                        </Button>
                        <Button onClick={setPlacement} value="left">left</Button>
                        <Button onClick={setPlacement} value="right">right</Button>
                    </Space>
                }
            >
                {this.props.children}
            </Drawer>
        )
    }
}
