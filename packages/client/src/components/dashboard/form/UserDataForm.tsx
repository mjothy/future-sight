import React, { Component } from 'react'
import { Button, Col, Input, Row, Tag, Tooltip } from 'antd';
import { UserOutlined, TagOutlined, EditFilled } from '@ant-design/icons';

export default class UserDataForm extends Component<any, any> {

    saveInputRef;
    constructor(props) {
        super(props)
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputConfirm = this.handleInputConfirm.bind(this);
        this.saveInputRef = React.createRef();
        this.state = {
            tags: ['Tag 1', 'Tag 2'],
            inputVisible: false,
            inputValue: '',
        };
    }

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.saveInputRef.current.focus());
    }

    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value });
    }

    handleInputConfirm = () => {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
    }

    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        console.log(tags);
        this.setState({ tags });
    }

    render() {
        const { tags, inputVisible, inputValue } = this.state;

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

                    <div className='tag-input-content'>
                        <TagOutlined className="site-form-item-icon" />
                        <p>
                            {tags.map((tag, index) => {
                                const isLongTag = tag.length > 20;
                                const tagElem = (
                                    <Tag key={tag} closable onClose={() => this.handleClose(tag)}>
                                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                    </Tag>
                                );
                                return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                            })}

                            {inputVisible && (
                                <Input
                                    ref={this.saveInputRef}
                                    size="small"
                                    className="tag-input"
                                    value={inputValue}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputConfirm}
                                    onPressEnter={this.handleInputConfirm}
                                />
                            )}
                            {!inputVisible && <Button size="small" type="dashed" onClick={this.showInput}>+ New Tag</Button>}
                        </p>
                    </div>
                </Col>
            </Row>
        )
    }
}
