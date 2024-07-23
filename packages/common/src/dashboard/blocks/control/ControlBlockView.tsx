import { Col, Row } from 'antd';
import { Component } from 'react';
import BlockStyleModel from '../../../models/BlockStyleModel';
import { getChildrens } from '../utils/BlockDataUtils';
import * as _ from 'lodash';
import SelectInput from '../utils/SelectInput';
import ConfigurationModel from '../../../models/ConfigurationModel';
require('./ControlBlockView.css')

export default class ControlBlockView extends Component<any, any> {

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.props.getMetaData(this.props.currentBlock)) !== JSON.stringify(this.props.getMetaData(prevProps.currentBlock))) {
      this.retrieveData();
    }
  }

  retrieveData = () => {
    this.props.updateLoadingControlBlock(this.props.currentBlock.id, true).then(() => {
      const childrens: any[] = getChildrens(this.props.dashboard.blocks, this.props.currentBlock.id);
      this.props.blockData(this.props.currentBlock, childrens).then(() => {
        this.props.updateLoadingControlBlock(this.props.currentBlock.id, false)
      })
    })
  }

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    let shouldUpdate = true;
    const config1 = nextProps.currentBlock.config;
    const config2 = this.props.currentBlock.config;
    // Check configuration
    if (this.props.width == nextProps.width && this.props.height == nextProps.height) {
      if (_.isEqual(config1.metaData, config2.metaData) && _.isEqual(config1.configStyle, config2.configStyle)) {
        shouldUpdate = false;
      }
    }

    return shouldUpdate;
  }

  onChange = (option, selectedData: string[]) => {
    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    const config = dashboard.blocks[this.props.currentBlock.id].config;

    // update current block config (metadata)
    config.metaData.master[option].values = selectedData;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config };

    // Update children
    const childrens: any[] = getChildrens(dashboard.blocks, this.props.currentBlock.id);

    if (childrens.length > 0) {
      // childrens.map((child: BlockModel | any) => 
      for (const child of childrens) {
        const configChild: ConfigurationModel = child.config;
        this.props.optionsLabel.map((option) => {
          const isMaster = config.metaData.master[option].isMaster;
          if (isMaster) {
            //we slice to deepcopy the array
            configChild.metaData[option] = config.metaData.master[option].values;
            dashboard.blocks[child.id].config = { ...configChild };
          }
        });
      }
    }

    this.props.updateDashboard(dashboard)
  };

  selectDropDown = (option) => {
    const metaData = this.props.currentBlock.config.metaData;
    const optionLabel = this.props.currentBlock.config.configStyle.subtitle[option].isCustom ?
      this.props.currentBlock.config.configStyle.subtitle[option].value : option;
    const config = this.props.currentBlock.config.configStyle;
    return (
      <div className="control-block-row" key={option}>
        <h4 className="control-block-subtitle"> {optionLabel}: </h4>
        <SelectInput disableMultiSelect={config.disableMultiSelect}
          type={option}
          isClosable={true}
          label={optionLabel}
          className={"control-block-select"}
          value={metaData.master[option].values}
          onChange={this.onChange}
          options={metaData[option]}
           docs={this.props.docData[option]}
        />
      </div>
      // <Row className="mb-10" key={option}>
      //   <Col span={6}>
      //     <h4>{optionLabel}: </h4>
      //   </Col>
      //   <Col span={18}>
      //     <Select
      //       mode="multiple"
      //       className="width-100"
      //       value={metaData.master[option].values}
      //       onChange={(e) => this.onChange(option, e)}
      //       dropdownMatchSelectWidth={false}
      //     >
      //       {metaData[option].map((element) => (
      //         <Option key={element} value={element}>
      //           {element}
      //         </Option>
      //       ))}
      //     </Select>
      //   </Col>
      // </Row>
    );
  };

  render() {
    const metaData = this.props.currentBlock.config.metaData;

    const configStyle: BlockStyleModel =
      this.props.currentBlock.config.configStyle;
    return (
      <div className={'width-100 height-100 control-block-container'}
        style={{ overflowY: "auto", paddingRight: "10px", paddingLeft: "10px", paddingTop: "6px" }}>
        {configStyle.title.isVisible ? (
          <Row>
            <Col span={24}>
              <h3>{configStyle.title.value}</h3>
            </Col>
          </Row>
        ) : undefined
        }

        {metaData.selectOrder.map((option) => this.selectDropDown(option))}
      </div>
    );
  }
}
