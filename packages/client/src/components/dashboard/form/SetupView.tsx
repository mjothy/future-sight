import { Component } from 'react';
import PopupFilterContent from './PopupFilterContent';
import { Modal, Button } from 'antd';
import { FilterTwoTone } from '@ant-design/icons';
import { DataStructureModel, getSelectedFilter } from '@future-sight/common';

const { confirm } = Modal;

/**
 * The view for setting dashboard mataData
 */
export default class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      dataStructure: structuredClone(this.props.dashboard.dataStructure),
      visible: this.hasFilters() === undefined,
      isSubmit: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Update the filter state after modal open/close
    if (this.state.visible !== prevState.visible) {
      this.setState({ dataStructure: structuredClone(this.props.dashboard.dataStructure) })
      Object.keys(this.props.dashboard.dataStructure).map((key) => {
        if (this.props.dashboard.dataStructure[key].isFilter)
          this.props.updateSelectedFilter(key);
      });
    }
  }

  hasFilters = () => {
    let has: string | undefined = undefined;
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
    // Check if there is an already selected filter
    if (this.hasFilters() !== undefined) {
      this.setState({ isSubmit: true }, () => {
        this.showConfirm()
      })
    } else {
      this.setState({ visible: false });
      this.updateDashboardDataStructure();
    }

  }

  updateDashboardDataStructure = () => {
    const newDataStructure = new DataStructureModel();
    const selectedFilter = getSelectedFilter(this.state.dataStructure);
    newDataStructure[selectedFilter] = this.state.dataStructure[selectedFilter];
    this.props.updateDashboardMetadata({
      dataStructure: newDataStructure,
    });
  }

  showConfirm = () => {
    confirm({
      title: 'Do you Want to update the current filter?',
      content: 'If you are removing data from your filter, that will remove all blocks using them.',
      onOk: () => {
        console.log('OK');
        this.setState({ visible: false });
        this.updateDashboardDataStructure();
      },
      onCancel: () => {
        console.log('Cancel');
        this.setState({ isSubmit: false });
        this.handleCancel();
      }
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
          destroyOnClose={true}
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
