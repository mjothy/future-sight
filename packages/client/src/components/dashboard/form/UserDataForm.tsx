import React, { Component } from 'react'
import { Button, Col, Input, Row, Tag, Tooltip } from 'antd';
import { UserOutlined, TagOutlined, EditFilled } from '@ant-design/icons';

export default class UserDataForm extends Component<any, any> {

    saveInputRef;
    constructor(props) {
        super(props)
        this.saveInputRef = React.createRef();
        this.state = {
            tags: this.props.userData.tags,
            inputVisible: false,
            inputValue: '',
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.tags !== this.state.tags) {
            this.handleTags()
        }
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
        this.setState({ tags });
    }

    /**
     * Update user data 
     * @param e HTML input element
     */
    handleUserData = (e) => {
        const data = {
            name: e.currentTarget.name,
            value: e.currentTarget.value
        }
        this.props.handleUserData(data)
    }

    /**
     * Update tags
     */
    handleTags = () => {
        const data = {
            name: 'tags',
            value: this.state.tags
        }
        this.props.handleUserData(data)
    }

    render() {
        const { tags, inputVisible, inputValue } = this.state;

        return (
            <Row justify="space-evenly">
                <Col xs={20} sm={20} md={6} lg={7} >
                    <Input
                        defaultValue={this.props.userData.title}
                        name='title'
                        prefix={<EditFilled className="site-form-item-icon" />} placeholder="Title" onChange={this.handleUserData}
                    />
                </Col>

                <Col xs={20} sm={20} md={6} lg={7} >
                    <Input
                        defaultValue={this.props.userData.author}
                        name='author'
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="Author"
                        onChange={this.handleUserData}
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
