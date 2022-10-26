import React, { useState } from 'react';
import AddButton from './actions/AddButton';
import { Button, Col, Row, notification, Modal } from 'antd';
import { DashboardProps } from '../Dashboard';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas'
import {EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const DEFAULT_PREVIEW_WIDTH = 800;
const DEFAULT_PREVIEW_HEIGHT = 450;

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
    const dashboard = document.querySelector(".dashboard-content") as HTMLElement
    if (dashboard) {
      dashboard.classList.add('publishing');
      let timer = setInterval(function() {
        if (dashboard.classList.contains('publishing')) {
          //run some other function
          makeAndResizePreview(dashboard).then(function(dataURL) {
            save(dataURL);
          });
          clearInterval(timer);
        }
      }, 200);
    } else {
      save()
    }
  };

  const makeAndResizePreview = (dashboard) => {
    return html2canvas(dashboard).then((function(canvas) {
      const dataURL = canvas.toDataURL();
      return resizeDataURL(dataURL, DEFAULT_PREVIEW_WIDTH, DEFAULT_PREVIEW_HEIGHT)
    }));
  }

  function resizeDataURL(datas, wantedWidth, wantedHeight) {
    return new Promise<any>(async function (resolve, reject){
      // We create an image to receive the Data URI
      const img = document.createElement('img');

      // When the event "onload" is triggered we can resize the image.
      img.onload = function()
      {
        // We create a canvas and get its context.
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // We set the dimensions at the wanted size.
        canvas.width = wantedWidth;
        canvas.height = wantedHeight;
        if (ctx) {
          ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);
          const dataURI = canvas.toDataURL("image/jpeg");
          resolve(dataURI);
        } else {
          resolve(undefined);
        }
      };
      img.src = datas;
    })
  }

  const save = (image ?: string) => {
    saveDashboard((idPermanent) => {
      setPublishing(false);
      notification.success({
        message: 'The dashboard has been correctly published',
        placement: 'topRight',
      });
      setTimeout(() => {
        navigate('/view?id=' + idPermanent);
      }, 1000);
    }, image);
  }

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
            <p className="p-10"><QuestionCircleOutlined /><em>Hint : Click on the <EditOutlined /> button to modify a block !</em></p>
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
