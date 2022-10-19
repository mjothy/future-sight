import React from 'react';
import {Card, Space, Tag} from 'antd';
import {Link} from 'react-router-dom';
import {DeleteOutlined, RightCircleTwoTone} from '@ant-design/icons';
import './DraftPreview.css';
import {removeDraft} from "./DraftUtils";

class DraftPreview extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    getCardDescription = () => {
        return (
            <div>
                <p>
                    Author: {this.props.conf.userData.author}
                    {
                        !!this.props.conf.date &&
                        <span>
                            <br/>
                            {new Date(this.props.conf.date).toLocaleString(
                                [],
                                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})
                            }
                        </span>
                    }
                </p>
                <div className="preview-container">{this.getTags()}</div>
            </div>
        );
    };

    getTags = () => {
        const content: JSX.Element[] = [];
        this.props.conf.userData.tags.forEach((tag) => {
            content.push(<Tag>{tag}</Tag>);
        });
        return content;
    };

    onDeleteDraft = () => {
        removeDraft(this.props.id)
        this.props.refreshDrafts()
    }

    render() {

        const actions = [
            /*<Tooltip key="copy"  title="Copy this dashboard in draft">
              <CopyOutlined />
            </Tooltip>,*/
            <Link key="goto" to={this.props.urlPrefix + this.props.id}>
                <Space>
                    <RightCircleTwoTone key="share"/>
                    <div>Open</div>
                </Space>
            </Link>,
            <Space onClick={this.onDeleteDraft} key="delete">
                <DeleteOutlined/>
            </Space>
        ]

        return (
            <Card actions={actions} className="draft-preview">
                <Card.Meta
                    title={this.props.conf.userData.title}
                    description={this.getCardDescription()}
                />
            </Card>
        );
    }
}

export default DraftPreview