import {Component} from 'react'
import {Menu} from 'antd';
import {HomeOutlined} from '@ant-design/icons';

import './Navbar.css'
import Logo from '../../assets/images/ECEMF_logo.png'

export default class Navbar extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"navbar"}>
                <Menu theme="dark" mode="horizontal">
                    <img src={Logo} alt="Logo"/>
                    <Menu.Item key="home" icon={<HomeOutlined/>}>
                        Home
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
}
