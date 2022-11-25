import AddButton from './actions/AddButton';
import { Button, Col, Row, Modal } from 'antd';
import {DragOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';


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
const DashboardControl: React.FC<any> = ({
                                                        addBlock,
                                                        onPublish,
                                                        publishing
}) => {

  const clicked = (blockType: string) => {
    addBlock(blockType);
  };

  return (
      <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 64px)',
            flex: "1"
          }}
      >
        <Row >
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
            <p><QuestionCircleOutlined /> <em>Click on the <EditOutlined /> button to modify a block !</em></p>
            <p><QuestionCircleOutlined /> <em>Drag and drop the <DragOutlined /> button to move a block !</em></p>
          </Col>
        </Row>
        <Row style={{marginTop: "auto"}}>
          <Col span={24}>
            <Button
                type="primary"
                danger
                className="width-100"
                onClick={() =>
                    Modal.confirm({
                      title: 'Do you want to publish the dashboard?',
                      content: "The dashboard won't be editable anymore.",
                      onOk() {
                        onPublish();
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
