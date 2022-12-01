import React, { Component } from 'react';
import { Button, Col, Popconfirm, Row, Tooltip, Tabs } from 'antd';
import DataBlockVisualizationEditor from './data/DataBlockVisualizationEditor';
import TextBlockEditor from './text/TextBlockEditor';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import ControlBlockVisualizationEditor from './control/ControlBlockVisualizationEditor';
import BlockFilterManager from './BlockFilterManager';

const { TabPane } = Tabs;

/**
 * Render the view edit block according the the selected type
 */
export default class BlockEditorManager extends Component<any, any> {

  readonly tabsTypes = [
    { title: 'Data', icon: <EditOutlined />, type: 'data' },
    { title: 'Visualization', icon: <EyeOutlined />, type: 'style' },
  ];

  constructor(props) {
    super(props);
    this.state = {
      tab: 'data',
    };
  }

  hasTabs = (type) => {
    return type === 'data' || type === 'control';
  };

  blockByType = () => {
    switch (this.props.currentBlock.blockType) {
      case 'data':
        if (this.state.tab === 'data') {
          return (
            <BlockFilterManager
              {...this.props}
            />
          );
        } else {
          return (
            <DataBlockVisualizationEditor
              {...this.props}
            />
          );
        }
      case 'text':
        return <TextBlockEditor {...this.props} />;
      case 'control':
        if (this.state.tab === 'data') {
          return (
            <BlockFilterManager
              {...this.props}
            />
          );
        } else {
          return (
            <ControlBlockVisualizationEditor
              {...this.props}
            />
          );
        }
      default:
        return <p>Error !</p>;
    }
  };

  tabsToggle = (tabType) => {
    this.setState({ tab: tabType });
  };

  onConfirm = () => {
    const blocksAndLayout = this.props.deleteBlocks([this.props.blockSelectedId])
    this.props.updateDashboard({ ...this.props.dashboard, ...blocksAndLayout });
  }

  render() {

    return (
      <>
        <Row
          justify={
            this.hasTabs(this.props.currentBlock.blockType)
              ? 'space-between'
              : 'end'
          }
        >
          {this.hasTabs(this.props.currentBlock.blockType) && (
            <Col span={22}>
              <Tabs type="card" onChange={(activeKey) => this.tabsToggle(activeKey)}>
                {this.tabsTypes.map((tab) => {
                  return (
                    <TabPane key={tab.type} tab={
                      <span>
                        {tab.icon}
                        {tab.title}
                      </span>
                    }
                    />
                  );
                })}
              </Tabs>
            </Col>
          )}
          <Col span={2}>
            <Popconfirm
              title="Are you sure you want to delete this block ?"
              onConfirm={this.onConfirm}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip placement="left" title="Delete block">
                <Button type="default" icon={<DeleteOutlined />} danger size="large" />
              </Tooltip>
            </Popconfirm>
          </Col>
        </Row>

        <div className="width-100">
          {this.blockByType()}
        </div>
      </>
    );
  }
}
