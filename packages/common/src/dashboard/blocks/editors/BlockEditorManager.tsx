import React, { Component } from 'react';
import ControlBlock from './ControlBlock';
import DataBlock from './DataBlock';
import TextBlock from './TextBlock';
import PropTypes from 'prop-types';
import { Button, Col, Divider, Row } from 'antd';
import DataBlockVisualization from './DataBlockVisualization';

/**
 * Render the view edit block according the the selected type
 */
export default class BlockEditorManager extends Component<any, any> {
  static propTypes = {
    blockType: PropTypes.string,
  };

  blockSelectedId = this.props.blockSelectedId;
  blockType = this.props.blocks[this.blockSelectedId] ? this.props.blocks[this.blockSelectedId].blockType : "data";

  constructor(props) {
    super(props);
  }

  blockByType = () => {

    switch (this.blockType) {
      case "data":
        if (this.props.dataBlockTab === "data")
          return <DataBlock {...this.props} />
        else
          return <DataBlockVisualization {...this.props} />
      case "text":
        return <TextBlock {...this.props} />
      case "control":
        return <ControlBlock {...this.props} />
      default:
        return <p>Error !</p>;
    }
  };
  render() {

    const tabsToggle = (tabType) => {
      this.props.tabsToggle(tabType);
    }

    return (

      <>
        <Row justify={this.blockType === "data" ? 'space-between' : 'end'}>
          {this.blockType === "data" && <Col span={20}>
            <Row justify='start'>
              <Col span={10}>
                <Button type='default' onClick={() => tabsToggle("data")}>Data configuration</Button>
              </Col>
              <Col span={10} offset={1}>
                <Button type='default' onClick={() => tabsToggle("style")}>Visualisation</Button>
              </Col>
            </Row>
          </Col>}
          <Col>
            <Button type='default' onClick={() => this.props.updateSelectedBlock("")}>X</Button>
          </Col>
        </Row>

        <div className='width-100'>
          <Divider />
          {this.blockByType()}
          <div className='space-div'></div>

        </div>
      </>
    )
  }
}
