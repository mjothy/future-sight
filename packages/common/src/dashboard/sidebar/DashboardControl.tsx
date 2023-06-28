import AddButton from './actions/AddButton';
import {Button, Col, Row} from 'antd';
import {DragOutlined, EditOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import DashboardGlobalInfo from "./DashboardGlobalInfo";
import React, {useState} from "react";


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
