import { Component } from 'react';
import PopupFilterContent from './PopupFilterContent';
import { Modal, Button } from 'antd';
import { FilterTwoTone } from '@ant-design/icons';
import { getSelectedFiltersLabels } from '@future-sight/common';

const { confirm } = Modal;

/**
 * The view for setting dashboard mataData
 */
export default class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      dataStructure: JSON.parse(JSON.stringify(this.props.dashboard.dataStructure)),
      visible: getSelectedFiltersLabels(this.props.dashboard.dataStructure).length <= 0,
      isSubmit: false
    };
  }

  show = () => {
    this.setState({ visible: true })
  }

  handleCancel = () => {
    this.setState({
      isSubmit: false,
      visible: false,
      dataStructure: JSON.parse(JSON.stringify(this.props.dashboard.dataStructure)),
    })
  }

  updateDataStructure = (dataStructure) => {
    this.setState({ dataStructure });
  }

  handleOk = () => {
    // Check if there is an already selected filter
    if (getSelectedFiltersLabels(this.props.dashboard.dataStructure).length > 0) {
      this.setState({ isSubmit: true }, () => {
        this.showConfirm()
      })
    } else {
      this.setState({ visible: false });
      this.updateDashboardDataStructure();
    }

  }

  updateDashboardDataStructure = () => {
    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    dashboard.dataStructure = this.state.dataStructure;
    this.props.updateDashboard(dashboard);
    this.setState({
      visible: false,
      dataStructure: JSON.parse(JSON.stringify(dashboard.dataStructure))
    })
  }

  showConfirm = () => {
    confirm({
      title: 'Do you Want to update the current filter?',
      content: 'If you are removing data from your filter, that will remove all blocks using them.',
      onOk: () => {
        this.updateDashboardDataStructure();
      },
      onCancel: () => {
        this.handleCancel();
      }
    });
  }

  render() {
    const selectedFilters = getSelectedFiltersLabels(this.props.dashboard.dataStructure);
    let selectedFilterLabel = ""
    if (selectedFilters.length > 0) {
      selectedFilters.forEach(filter => {
        if (this.props.dashboard.dataStructure[filter].selection.length > 0) {
          selectedFilterLabel = ': ' + filter;

        }
      })
    }
    return (
      <>
        <div className="back-to-setup">
          <Button value="setup" onClick={this.show}>
            <FilterTwoTone />Data focus {selectedFilterLabel}
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
