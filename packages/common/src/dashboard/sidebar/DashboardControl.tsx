import AddButton from './actions/AddButton';
import {Button, Col, Row} from 'antd';
import {DragOutlined, EditOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import DashboardGlobalInfo from "./DashboardGlobalInfo";
import React, {useState} from "react";


const actions = [
  {
    label: 'Data block',
    info: 'Standard graph block, start here for a simple visualisation !',
    button: "primary",
    type: 'data',
  },
  {
    label: 'Text block',
    info: 'A text area to explain some context, or add details.',
    button: "default",
    type: 'text',
  },
  {
    label: 'Control block',
    info: 'A complex block to allow interactive use of datablocks by the viewer.',
    button: "default",
    type: 'control',
  },
  {
    label: 'JSON block',
    info: 'A developper block that allow json plotly charts.',
    button: "default",
    type: 'json',
  },
];

/**
 * Sidebar when no block is selected (to create new block or publish dashboard)
 */
const DashboardControl: React.FC<any> = (props) => {

  const clicked = (blockType: string) => {
    props.addBlock(blockType);
  };

  const [showPublishInfo, setShowPublishInfo] = useState(false);



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
              <Col key={action.type} span="6">
                <AddButton
                  action={action}
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
                onClick={() => setShowPublishInfo(true)}
                loading={props.publishing}
            >
              Publish
            </Button>
          </Col>
        </Row>
        <DashboardGlobalInfo
            key={"publishDashboardGlobalInfo"}
            closeGlobalInfoModal={()=>setShowPublishInfo(false)}
            isShowGlobalInfo={showPublishInfo}
            title={"Do you want to publish the dashboard?"}
            message={"The dashboard won't be editable anymore"}
            onOk={props.onPublish}
            {...props}
        />
      </div>
  );
};

export default DashboardControl;
