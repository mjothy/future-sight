import React, { Component } from 'react';
import { Button, Col, Divider, Row } from 'antd';
import DataBlockEditor from './DataBlockEditor';
import TextBlockEditor from './TextBlockEditor';
import ControlBlockEditor from './ControlBlockEditor';
import DataBlockVisualizationEditor from './DataBlockVisualizationEditor';

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
            <Button
              type="default"
              onClick={() => this.props.updateSelectedBlock('')}
            >
              X
            </Button>
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
