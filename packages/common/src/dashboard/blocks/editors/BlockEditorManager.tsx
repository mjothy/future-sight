import React, { Component } from 'react';
import { Button, Col, Divider, Popconfirm, Row, Tooltip } from 'antd';
import DataBlockEditor from './DataBlockEditor';
import TextBlockEditor from './TextBlockEditor';
import ControlBlockEditor from './ControlBlockEditor';
import DataBlockVisualizationEditor from './DataBlockVisualizationEditor';
import {
  DeleteOutlined,
  BackwardOutlined
} from '@ant-design/icons';


/**
 * Render the view edit block according the the selected type
 */
export default class BlockEditorManager extends Component<any, any> {
  blockType;
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
        return (
          <TextBlockEditor
            {...this.props}
            currentBlock={currentBlock}
          />
        );
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
              />
            </Tooltip>
          </Col>
          {this.props.blocks[this.props.blockSelectedId].blockType ===
            'data' && (
            <Col span={20}>
              <Row justify="start">
                <Col span={10}>
                  <Button type="default" onClick={() => tabsToggle('data')}>
                    Data configuration
                  </Button>
                </Col>
                <Col span={10} offset={1}>
                  <Button type="default" onClick={() => tabsToggle('style')}>
                    Visualisation
                  </Button>
                </Col>
              </Row>
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
                <Button
                    type="default"
                    icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Col>
        </Row>

        <div className="width-100">
          <Divider />
          {this.blockByType()}
          <div className="space-div"></div>
        </div>
      </>
    );
  }
}
