import { Component } from 'react';
import Modal from 'antd/lib/modal/Modal';
import PopupFilterContent from './PopupFilterContent';

/**
 * The view for setting dashboard mataData
 */
export default class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      dataStructure: structuredClone(this.props.dashboard.dataStructure),
      selectedFilter: '',
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
  /**
   * Receive the user data from UserDataForm and send it to DashboardView to update the parent state
   * @param data contains the information of the dashboard {title, author and tags}
   */
  handleUserData = (data) => {
    this.props.updateUserData(data);
  };

  render() {
    const handleOk = () => {
      this.setState({ visible: false });
      this.props.updateDashboardMetadata({
        dataStructure: this.state.dataStructure,
      });
      this.props.submitEvent('dashboard');
    };

    const handleCancel = () => {
      this.setState({
        visible: false,
        selectedFilter: '',
        dataStructure: structuredClone(this.props.dashboard.dataStructure),
      });
      this.props.updateSelectedFilter('');
      this.props.submitEvent('dashboard');
    };

    const updateDataStructure = (dataStructure) => {
      this.setState({ dataStructure });
    };

    return (
      <Modal
        title="Set up filter data"
        visible={this.props.visible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
        maskClosable={false}
        zIndex={2}
        okText={'submit'}
      >
        <PopupFilterContent
          {...this.props}
          dataStructure={this.state.dataStructure}
          updateDataStructure={updateDataStructure}
          handleOk={handleOk}
        />
      </Modal>
    );
  }
}
