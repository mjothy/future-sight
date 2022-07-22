import { Component } from 'react'
import { Col, Input, Row } from 'antd';
import { UserOutlined, TagOutlined, EditFilled } from '@ant-design/icons';

// To send the user information to ViewSetup
// INPUT: 
// Output: title, author, tags

export default class UserDataForm extends Component {
    render() {
        return (
            <Row justify="space-evenly">
                <Col xs={20} sm={20} md={6} lg={7} >
                    <Input
                        prefix={<EditFilled className="site-form-item-icon" />} placeholder="Title"
                    />
                </Col>

                <Col xs={20} sm={20} md={6} lg={7} >
                    <Input
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="Author"
                    />
                </Col>

                <Col xs={20} sm={20} md={6} lg={7} >
                    {/* Search for antd design tag */}
                    <Input
                        prefix={<TagOutlined className="site-form-item-icon" />}
                        placeholder="Tag1; Tag2; "
                    />
                </Col>
            </Row>
        )
    }
}
