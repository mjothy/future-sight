import { Component } from 'react';
import PopupFilterContent from './PopupFilterContent';
import { Modal, Button } from 'antd';
import { FilterTwoTone } from '@ant-design/icons';
import { getSelectedFiltersLabels } from '@future-sight/common';
import withDataManager from '../../../services/withDataManager';
import * as _ from 'lodash';

const { confirm } = Modal;

/**
 * The view for setting dashboard mataData
 */
class SetupView extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      dataStructure: JSON.parse(JSON.stringify(this.props.dashboard.dataStructure)),
      visible: getSelectedFiltersLabels(this.props.dashboard.dataStructure).length <= 0,
      isSubmit: false,
      optionsData: { ...this.props.allData },
      isFetching: false,
      needToFetch: {
        regions: false,
        variables: false,
        scenarios: false,
        models: false
      }
    };
  }

  async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
    if (prevState.visible != this.state.visible && this.state.visible) {
      const optionsData = await this.getOptionsData();
      this.setState({ optionsData, isFetching: false });
    }

    if (!_.isEqual(this.state.dataStructure, prevState.dataStructure)) {
      const selectionDataStructure = Object.keys(this.state.dataStructure).filter(key => this.state.dataStructure[key].isFilter)
      const selectionPrevDataStructure = Object.keys(prevState.dataStructure).filter(key => prevState.dataStructure[key].isFilter);
      // If selection changed (input deselected)
      if (selectionDataStructure.length < selectionPrevDataStructure.length) {
        const optionsData = await this.getOptionsData();
        this.setState({ optionsData, isFetching: false });
      }
    }
  }

  getOptionsData = async () => {
    const data = {
      regions: [],
      variables: [],
      scenarios: [],
      models: []
    }
    this.props.optionsLabel.forEach(option => {
      data[option] = this.state.dataStructure[option].selection;
    })
    this.setState({ isFetching: true })
    const optionsData = await this.props.dataManager.fetchDataFocusOptions({
      data
    });
    return optionsData;
  }

  updateOptionsData = async (type) => {
    const optionsData = await this.getOptionsData(); //TODO get options of other selected inputs (!= type)
    this.setState({ optionsData, isFetching: false });
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
            optionsLabel={this.props.optionsLabel}
            dataStructure={this.state.dataStructure}
            updateDataStructure={this.updateDataStructure}
            handleOk={this.handleOk}
            optionsData={this.state.optionsData}
            needToFetch={this.state.needToFetch}
            isFetching={this.state.isFetching}
            updateOptionsData={this.updateOptionsData}
          />
        </Modal>
      </>
    );
  }
}

export default withDataManager(SetupView);