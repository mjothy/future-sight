import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {
    LeftCircleFilled
} from '@ant-design/icons';
import { Button, Drawer, Space } from 'antd';
export default class Sidebar extends Component<any, any> {

    static propTypes = {
        visible: PropTypes.bool,
        submitSetupView: PropTypes.func,
        setVisibility: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.state = {
            placement: 'right',
        }
    }

    render() {

        const setPlacement = (e) => {
            this.setState({ placement: e.currentTarget.value })
        }

        return (
            <Drawer
                placement={this.state.placement}
                width={500}
                visible={this.props.sidebarVisible}
                onClose={this.props.setVisibility}
                maskClosable={true}
                mask={true}
                className={"drawer"}
                style={!this.props.sidebarVisible ? { zIndex: '-1' } : { zIndex: '999' }}
                extra={
                    <Space>
                        <Button onClick={() => this.props.submitSetupView(false)}>
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
