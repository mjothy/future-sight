import React, { Component } from 'react';
import { Button, Col, Input, Modal, Row, Tag, Tooltip } from 'antd';
import { UserOutlined, TagOutlined, EditFilled } from '@ant-design/icons';
import UserDataModel from '../../models/UserDataModel';

/**
 * To set dashboard global information (title, author and tags)
 */
export default class DashboardGlobalInfo extends Component<any, any> {
  saveInputRef;
  constructor(props) {
    super(props);
    this.saveInputRef = React.createRef();
    this.state = {
      inputVisible: false,
      inputValue: '',
      isModalOpen: true,
      userData: new UserDataModel()
    };
  }

  componentDidMount(): void {
    this.setState({ userData: { ...this.props.dashboard.userData } })
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () =>
      this.saveInputRef.current.focus()
    );
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = this.state.userData.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    const userData = Object.assign({}, this.state.userData);
    userData.tags = tags;
    this.setState({
      userData,
      inputVisible: false,
      inputValue: '',
    });
  };

  handleClose = (removedTag) => {
    const userData = { ...this.state.userData };
    const tags = userData.tags.filter((tag) => tag !== removedTag);
    userData.tags = tags;
    this.setState({ userData });
  };

  onTitleChange = (e) => {
    const userData = { ...this.state.userData };
    userData.title = e.target.value;
    this.setState({ userData });
  }

  onAuthorChange = (e) => {
    const userData = { ...this.state.userData };
    userData.author = e.target.value;
    this.setState({ userData });
  }

  showModal = () => {
    this.props.openGlobalInfoModal()
  };

  handleOk = () => {
    this.props.updateDashboardMetadata({ userData: this.state.userData });
    this.props.closeGlobalInfoModal();
  };

  handleCancel = () => {
    this.setState({ userData: { ...this.props.dashboard.userData } }, () => this.props.closeGlobalInfoModal());

  };

  render() {
    const { inputVisible, inputValue } = this.state;
    return (
      <Modal title="Dashboard information" visible={this.props.isShowGlobalInfo} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Input
          value={this.state.userData.title}
          name="title"
          prefix={<EditFilled className="site-form-item-icon" />}
          placeholder="Title"
          onChange={(e) => this.onTitleChange(e)}
          allowClear={true}
        />

        <Input
          className='mt-20'
          value={this.state.userData.author}
          name="author"
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="Author"
          onChange={(e) => this.onAuthorChange(e)}
          allowClear={true}
        />

        <div className=" mt-20 tag-input-content">
          <TagOutlined className="site-form-item-icon" />
          <p>
            {this.state.userData.tags.map((tag, index) => {
              const isLongTag = tag.length > 20;
              const tagElem = (
                <Tag key={tag} closable onClose={() => this.handleClose(tag)}>
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </Tag>
              );
              return isLongTag ? (
                <Tooltip title={tag} key={tag}>
                  {tagElem}
                </Tooltip>
              ) : (
                tagElem
              );
            })}

            {inputVisible && (
              <Input
                ref={this.saveInputRef}
                size="small"
                className={"tag-input"}
                value={inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleInputConfirm}
                onPressEnter={this.handleInputConfirm}
              />
            )}
            {!inputVisible && (
              <Button size="small" type="dashed" onClick={this.showInput}>
                + New Tag
              </Button>
            )}
          </p>
        </div>
      </Modal>

    );
  }
}
