import { Component } from 'react';
import Modal from 'antd/lib/modal/Modal';
import PopupFilterContent from './PopupFilterContent';
import { Button } from 'antd';
import { FilterTwoTone } from '@ant-design/icons';

/**
 * The view for setting dashboard mataData
 */
export default class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      dataStructure: structuredClone(this.props.dashboard.dataStructure),
      visible: this.hasFilters() === undefined
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Update the filter state after modal open/close
    if (this.props.visible !== prevProps.visible) {
      Object.keys(this.props.dashboard.dataStructure).map((key) => {
        if (this.props.dashboard.dataStructure[key].isFilter)
          this.props.updateSelectedFilter(key);
      });
    }
  }

  hasFilters = () => {
    let has : string|undefined = undefined;
    for (const filter in this.props.dashboard.dataStructure) {
      if (this.props.dashboard.dataStructure[filter].isFilter) {
        has = filter
        break;
      }
    }
    return has;
  }

  show = () => {
    this.setState({ visible: true })
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  hasFilledStructure = () => {
    return Object.keys(this.props.structureData).length !== 0
  }

  updateDataStructure = (dataStructure) => {
    this.setState({ dataStructure });
  }

  handleOk = () => {
    this.setState({ visible: false });
    this.props.updateDashboardMetadata({
      dataStructure: this.state.dataStructure,
    });
  }

  render() {
    return (
      <>
        <div className="back-to-setup">
          <Button value="setup" onClick={this.show}>
            <FilterTwoTone />Data focus {this.hasFilters() ? ": " + this.hasFilters() : ""}
          </Button>
        </div>
        <Modal
          title="Choose the data to focus on:"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          closable={false}
          maskClosable={false}
          zIndex={2}
          okText={'submit'}
        >
          <PopupFilterContent
            {...this.props}
            dataStructure={this.state.dataStructure}
            updateDataStructure={this.updateDataStructure}
            handleOk={this.handleOk}
          />
        </Modal>
      </>
    );
  }
}
