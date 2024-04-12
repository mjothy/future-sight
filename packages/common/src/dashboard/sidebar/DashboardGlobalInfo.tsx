import React, { Component } from 'react';
import {Alert, Button, Col, Collapse, Input, Modal, notification, Row, Tag, Tooltip } from 'antd';
import {
  UserOutlined,
  TagOutlined,
  EditFilled,
  MessageOutlined,
  WarningOutlined,
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  MailOutlined
} from '@ant-design/icons';
import UserDataModel from '../../models/UserDataModel';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const FORUM_ERROR = "Needs to be a valid ECEMF forum URL"
const URL_REGEX = /https:\/\/[^\s/$.?#].[^\s]*$/
const FORUM_PREFIX = "https://community.ecemf.eu/"
const MAIL_ERROR = "Needs to be a valid mail"
const MAIL_REGEX = /\S+@\S+\.\S+/
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
      userDataTemp: new UserDataModel(),
      forumError: null,
      mailError: null,
      username: null,
      password: null,
      loggedIn: null
    };
  }

  componentDidMount(): void {
    this.setState({ userDataTemp: { ...this.props.dashboard.userData } })
  }

  componentDidUpdate(prevProps, prevState): void {
    if(prevProps.dashboard.userData !== this.props.dashboard.userData) {
      this.setState({ userDataTemp: { ...this.props.dashboard.userData } })
    }
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

  onForumChange = (e) => {
    let value = e.target.value;
    const userData = { ...this.state.userDataTemp };
    userData.forum = value;
    if (value === "" || (value.startsWith(FORUM_PREFIX) && value.match(URL_REGEX))) {
      this.setState({ userDataTemp: userData, forumError: null});
    } else {
      this.setState({userDataTemp: userData, forumError: FORUM_ERROR})
    }
  }

  onMailChange = (e) => {
    let value = e.target.value
    const userData = { ...this.state.userDataTemp };
    userData.mail = value;
    if (value === null || value === "" || value.match(MAIL_REGEX)) {
      this.setState({ userDataTemp: userData, mailError: null});
    } else {
      this.setState({ userDataTemp: userData, mailError: MAIL_ERROR})
    }
  }

  handleOk = () => {
    try {
      if(this.state.mailError || this.state.forumError){
        this.openNotificationWithIcon('error', 'Error', 'Invalid information');
        return;
      }
      this.props.updateDashboard({ ...this.props.dashboard, userData: this.state.userDataTemp });
      this.props.closeGlobalInfoModal();
      this.props.onOk
        ? this.props.onOk(this.state.username, this.state.password)
        : this.openNotificationWithIcon('success', 'Update dashboard', 'Dashboard information updated successfully')
    } catch (e) {
      this.openNotificationWithIcon('error', 'Update dashboard', 'Error occured')
    }
  };

  handleCancel = () => {
    this.setState({ userDataTemp: { ...this.props.dashboard.userData }, forumError: null, mailError: null }, () => this.props.closeGlobalInfoModal());
  };

  handleUserChange = (e) => {
    let value = e.target.value;
    this.setState({username: value});
  };

  handlePasswordChange = (e) => {
    let value = e.target.value;
    this.setState({password: value});
  };

  checkUser = () => {
    const username = this.state.username;
    const password = this.state.password;
    if (!!username && !!password) {
      this.props.checkUser(username, password).then((body) => {
        if(body.ok) {
          this.setState({loggedIn: true})
        } else {
          this.setState({loggedIn: false})
        }
      })
    } else {
      this.setState({loggedIn: null})
    }
  }

  openNotificationWithIcon = (type: NotificationType, title: string, msg: string) => {
    notification[type]({
      message: title,
      description: msg
    });
  };

  render() {
    const { inputVisible, inputValue } = this.state;
    return (
      <Modal title={this.props.title
        ? this.props.title
        : "Dashboard information"}
        visible={this.props.isShowGlobalInfo}
        onOk={this.handleOk}
        onCancel={this.handleCancel}>

        {this.props.message && <p className='mb-20'>{this.props.message}</p>}

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
        <div className="mt-20 tag-input-content">
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
        <Collapse className='mt-20'>
          <Collapse.Panel header="Are you an ECEMF member ?" key="1">
            <Row justify="space-between">
              <Col span={4}>
                <span>ECEMF forum link: </span>
              </Col>
              <Col span={18}>
                <Input
                    value={this.state.userDataTemp.forum}
                    name="forum"
                    prefix={this.state.forumError ?
                        <Tooltip title={this.state.forumError}>
                          <WarningOutlined />
                        </Tooltip>
                        : <MessageOutlined className="site-form-item-icon" />}
                    placeholder="https://community.ecemf.eu/..."
                    onChange={(e) => this.onForumChange(e)}
                    allowClear={true}
                    status={this.state.forumError ? "error" : undefined}
                />
              </Col>
            </Row>
            <Row justify="space-between">
              <Col span={4}>
                <span>Mail to: </span>
              </Col>
              <Col span={18}>
                <Input
                    value={this.state.userDataTemp.mail}
                    name="Mail"
                    prefix={this.state.mailError ?
                        <Tooltip title={this.state.mailError}>
                          <WarningOutlined />
                        </Tooltip>
                        : <MailOutlined className="site-form-item-icon" />}
                    placeholder="model@testmail.com"
                    onChange={(e) => this.onMailChange(e)}
                    allowClear={true}
                    status={this.state.mailError ? "error" : undefined}
                />
              </Col>
            </Row>
            <Row className='mt-20'>
              <Col >
                <span>Scenario Explorer login (for verification mark)</span>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <Input
                    value={this.state.username}
                    placeholder="Username"
                    onChange={this.handleUserChange}
                    onBlur={this.checkUser}
                />
              </Col>
              <Col span={12}>
                <Input.Password
                    value={this.state.password}
                    placeholder="Password"
                    onChange={this.handlePasswordChange}
                    onBlur={this.checkUser}
                />
              </Col>
              <Col span={2} style={{textAlign: "center"}}>
                {this.state.loggedIn != null && (
                    this.state.loggedIn
                        ?
                        <Tooltip title="Successfully authenticated !">
                          <CheckCircleTwoTone style={{ fontSize: '24px' }} twoToneColor="lime"/>
                        </Tooltip>
                        :
                        <Tooltip title="Could not authenticate this user">
                          <ExclamationCircleTwoTone style={{ fontSize: '24px' }} twoToneColor="red"/>
                        </Tooltip>
                )}
              </Col>
            </Row>
          </Collapse.Panel>
        </Collapse>
      </Modal>

    );
  }
}
