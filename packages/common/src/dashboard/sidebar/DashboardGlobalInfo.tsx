import React, { Component } from 'react';
import { Button, Input, Modal, notification, Tag, Tooltip } from 'antd';
import { UserOutlined, TagOutlined, EditFilled } from '@ant-design/icons';
import UserDataModel from '../../models/UserDataModel';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

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
      userDataTemp: new UserDataModel()
    };
  }

  componentDidMount(): void {
    this.setState({ userDataTemp: { ...this.props.dashboard.userData } })
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
    let tags = this.state.userDataTemp.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    const userData = Object.assign({}, this.state.userDataTemp);
    userData.tags = tags;
    this.setState({
      userDataTemp: userData,
      inputVisible: false,
      inputValue: '',
    });
  };

  handleClose = (removedTag) => {
    const userData = { ...this.state.userDataTemp };
    const tags = userData.tags.filter((tag) => tag !== removedTag);
    userData.tags = tags;
    this.setState({ userDataTemp: userData });
  };

  onTitleChange = (e) => {
    const userData = { ...this.state.userDataTemp };
    userData.title = e.target.value;
    this.setState({ userDataTemp: userData });
  }

  onAuthorChange = (e) => {
    const userData = { ...this.state.userDataTemp };
    userData.author = e.target.value;
    this.setState({ userDataTemp: userData });
  }

  showModal = () => {
    this.props.openGlobalInfoModal()
  };

  handleOk = () => {
    try {
      // TODO update (dashboard)
      this.props.updateDashboardMetadata({ userData: this.state.userDataTemp });
      this.props.closeGlobalInfoModal();
      this.openNotificationWithIcon('success', 'Update dashboard', 'Dashboard information updated successfully')
    } catch (e) {
      this.openNotificationWithIcon('error', 'Update dashboard', 'Error occured')
    }

  };

  handleCancel = () => {
    this.setState({ userDataTemp: { ...this.props.dashboard.userData } }, () => this.props.closeGlobalInfoModal());
    this.openNotificationWithIcon('warning', 'Update canceled', '')
  };

  openNotificationWithIcon = (type: NotificationType, title: string, msg: string) => {
    notification[type]({
      message: title,
      description: msg
    });
  };

  render() {
    const { inputVisible, inputValue } = this.state;
    return (
      <Modal title="Dashboard information" visible={this.props.isShowGlobalInfo} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Input
          value={this.state.userDataTemp.title}
          name="title"
          prefix={<EditFilled className="site-form-item-icon" />}
          placeholder="Title"
          onChange={(e) => this.onTitleChange(e)}
          allowClear={true}
        />

        <Input
          className='mt-20'
          value={this.state.userDataTemp.author}
          name="author"
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="Author"
          onChange={(e) => this.onAuthorChange(e)}
          allowClear={true}
        />

        <div className=" mt-20 tag-input-content">
          <TagOutlined className="site-form-item-icon" />
          <p>
            {this.state.userDataTemp.tags.map((tag, index) => {
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
