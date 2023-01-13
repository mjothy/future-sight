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
      dataStructure: JSON.parse(JSON.stringify(this.props.dashboard.dataStructure)),
      visible: getSelectedFilter(this.props.dashboard.dataStructure) === '',
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
    if (getSelectedFilter(this.props.dashboard.dataStructure) !== '') {
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
    dashboard.dataStructure = new DataStructureModel();
    const selectedFilter = getSelectedFilter(this.state.dataStructure);
    dashboard.dataStructure[selectedFilter] = JSON.parse(JSON.stringify(this.state.dataStructure[selectedFilter]));

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
    const selectedFilter = getSelectedFilter(this.props.dashboard.dataStructure);
    let selectedFilterLabel = ""
    if (selectedFilter !== '' && this.props.dashboard.dataStructure[selectedFilter].selection.length>0) {
      selectedFilterLabel = ': ' + selectedFilter;
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
