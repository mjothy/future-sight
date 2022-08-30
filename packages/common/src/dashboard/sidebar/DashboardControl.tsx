import { Component } from 'react';
import AddButton from './actions/AddButton';
import { DashboardProps } from '../Dashboard';
import { Button, Col, Row } from 'antd';

const actions = [
  {
    label: 'Add data block',
    type: 'data',
  },
  {
    label: 'Add text block',
    type: 'text',
  },
  {
    label: 'Add control block',
    type: 'control',
  },
];

/**
 * Dashboard control: to set the block type and send a notification to parent (Dashboard) to add/edit block
 */
// export default class DashboardControl extends Component<DashboardProps, any> {
export default class DashboardControl extends Component<any, any> {

  constructor(props) {
    super(props);
  }

  clicked = (blockType: string) => {
    this.props.addBlock(blockType);
  };

  render() {
    return (
      <div>
        <Row justify='space-between'>
          {actions.map((action) => (
            <Col key={action.type} span="8">
              <AddButton
                label={action.label}
                type={action.type}
                clicked={() => this.clicked(action.type)}
              />
            </Col>
          ))}
        </Row>
        <Row>
            <Col span={24}>
        <Button type="primary" className='width-100 mt-20' onClick={this.props.saveDashboard}>
          Publish
        </Button>
            </Col>
        </Row>
      </div>
    );
  }
}
