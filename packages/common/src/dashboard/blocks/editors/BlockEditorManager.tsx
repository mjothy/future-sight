import React, { Component } from 'react';
import { Button, Col, Divider, Popconfirm, Row, Tooltip, Tabs } from 'antd';
import DataBlockEditor from './DataBlockEditor';
import TextBlockEditor from './TextBlockEditor';
import ControlBlockEditor from './ControlBlockEditor';
import DataBlockVisualizationEditor from './DataBlockVisualizationEditor';
import {
  DeleteOutlined,
  BackwardOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;

/**
 * Render the view edit block according the the selected type
 */
export default class BlockEditorManager extends Component<any, any> {
  blockType;
  readonly tabsTypes = [
    { title: 'Data configuration', icon: <EditOutlined />, type: 'data' },
    { title: 'Visualization', icon: <EyeOutlined />, type: 'style' },
  ];

  constructor(props) {
    super(props);
    this.state = {
      tab: 'data',
    };
  }

  blockByType = () => {
    const currentBlock = this.props.blocks[this.props.blockSelectedId];
    switch (currentBlock.blockType) {
      case 'data':
        if (this.state.tab === 'data')
          return (
            <DataBlockEditor {...this.props} currentBlock={currentBlock} />
          );
        else
          return (
            <DataBlockVisualizationEditor
              {...this.props}
              currentBlock={currentBlock}
            />
          );
      case 'text':
        return <TextBlockEditor {...this.props} currentBlock={currentBlock} />;
      case 'control':
        return (
          <ControlBlockEditor {...this.props} currentBlock={currentBlock} />
        );
      default:
        return <p>Error !</p>;
    }
  };

  render() {
    const tabsToggle = (tabType) => {
      this.setState({ tab: tabType });
    };

    return (
      <>
        <Row
          justify={
            this.props.blocks[this.props.blockSelectedId].blockType === 'data'
              ? 'space-between'
              : 'end'
          }
        >
          <Col>
            <Tooltip title="Back to blocks control">
              <Button
                type="primary"
                onClick={() => this.props.updateSelectedBlock('')}
                icon={<BackwardOutlined />}
                size="large"
              />
            </Tooltip>
          </Col>
          {this.props.blocks[this.props.blockSelectedId].blockType ===
            'data' && (
            <Col>
              <Tabs type="card" onChange={(activeKey) => tabsToggle(activeKey)}>
                {this.tabsTypes.map((tab) => {
                  return (
                    <TabPane
                      key={tab.type}
                      tab={
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
          <Col>
            <Popconfirm
              title="Are you sure you want to delete this block ?"
              onConfirm={this.props.deleteBlock}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete block">
                <Button type="default" icon={<DeleteOutlined />} size="large" />
              </Tooltip>
            </Popconfirm>
          </Col>
        </Row>

        <div className="width-100">
          {this.blockByType()}
          <div className="space-div"></div>
        </div>
      </>
    );
  }
}
