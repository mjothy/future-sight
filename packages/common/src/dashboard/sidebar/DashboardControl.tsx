import React, { useState } from 'react';
import AddButton from './actions/AddButton';
import { Button, Col, Row, notification, Modal } from 'antd';
import { DashboardProps } from '../Dashboard';
import { useNavigate } from 'react-router-dom';

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
const DashboardControl: React.FC<DashboardProps> = ({
  addBlock,
  saveDashboard,
}) => {
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const clicked = (blockType: string) => {
    addBlock(blockType);
  };

  const onClickHandler = () => {
    setPublishing(true);
    saveDashboard(() => {
      setPublishing(false);
      notification.success({
        message: 'The dashboard has been correctly published',
        placement: 'topRight',
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 64px)',
        justifyContent: 'space-between',
      }}
    >
      <Row justify="space-between">
        {actions.map((action) => (
          <Col key={action.type} span="8">
            <AddButton
              label={action.label}
              type={action.type}
              clicked={() => clicked(action.type)}
            />
          </Col>
        ))}
      </Row>
      <Row>
        <Col span={24}>
          <Button
            type="primary"
            danger
            className="width-100"
            onClick={() =>
              Modal.confirm({
                title: 'Do you want to publish the dashboard?',
                content: "The dashboard won't be editable.",
                onOk() {
                  onClickHandler();
                },
              })
            }
            loading={publishing}
          >
            Publish
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardControl;
