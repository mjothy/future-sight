import { Component } from 'react';
import AddButton from './actions/AddButton';
import { DashboardProps } from '../Dashboard';
import { Button } from 'antd';

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
        {actions.map((action) => (
          <AddButton
            key={action.type}
            label={action.label}
            type={action.type}
            clicked={() => this.clicked(action.type)}
          />
        ))}
        <Button type="primary" onClick={this.props.saveDashboard}>
          Publish
        </Button>
      </div>
    );
  }
}
