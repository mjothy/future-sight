import { Component } from 'react';
import PopupFilterContent from './PopupFilterContent';
import { Modal, Button } from 'antd';
import { FilterTwoTone, WarningOutlined } from '@ant-design/icons';
import { getSelectedFiltersLabels, OptionsDataModel } from '@future-sight/common';
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
      isFetching: true,
      needToFetch: {
        regions: false,
        variables: false,
        scenarios: false,
        models: false
      }
    };
  }

  async componentDidMount(): Promise<void> {
    const optionsData = await this.getOptionsData();
    this.setState({ optionsData, isFetching: false });
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
    const data = new OptionsDataModel();
    Object.keys(this.state.dataStructure).forEach(option => {
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

  isDataMissing = (type?: string) => {
    if (type) {
      const dataStructureData = this.state.dataStructure[type].selection;
      const optionsData = this.state.optionsData[type];

      const selected_in_options = dataStructureData.filter(value => optionsData.includes(value));
      return !(selected_in_options.length == dataStructureData.length)
    } else {
      let isMissing = false;
      for (const option of Object.keys(this.state.dataStructure)) {
        if (this.isDataMissing(option) && option != "categories") {
          isMissing = true;
          break;
        }
      }
      return isMissing;
    }

  }

  render() {
    const selectedFilters = getSelectedFiltersLabels(this.props.dashboard.dataStructure);
    let selectedFilterLabel = ": "
    if (selectedFilters.length > 0) {
      selectedFilters.forEach(filter => {
        selectedFilterLabel = selectedFilterLabel + filter + ", ";
      })
    }
    return (
      <>
        <div className="back-to-setup">
          <Button value="setup" onClick={this.show}>
            <FilterTwoTone />Data focus {selectedFilterLabel.slice(0, -2)}
          </Button>
        </div>
        <Modal
          title="Choose the data to focus on:"
          visible={this.state.visible}
          closable={false}
          maskClosable={false}
          zIndex={2}
          okText={'submit'}
          destroyOnClose={true}
          footer={
            <div>
              <Button onClick={this.handleCancel}>Cancel</Button>
              <Button type="primary" onClick={this.handleOk}>Submit</Button>
              {this.isDataMissing() && <p style={{ color: "#ff4d4f", margin: "5px 0" }}> <WarningOutlined /> There are missing data in your selection</p>}


            </div>
          }
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
            isDataMissing={this.isDataMissing}
          />
        </Modal >
      </>
    );
  }
}

export default withDataManager(SetupView);