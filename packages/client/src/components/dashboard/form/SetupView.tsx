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
      visible: false,
      optionsData: new OptionsDataModel(),
      optionsDataCache: new OptionsDataModel(),
      isFetching: false,
      filtersToNotUpdate: []
    };
  }

  async componentDidMount(): Promise<void> {
    const optionsData = await this.getOptionsData();
    if (optionsData != null) {
      this.setState({ optionsData, isFetching: false, optionsDataCache: optionsData });
    }
  }

  async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
    if (!_.isEqual(this.state.dataStructure, prevState.dataStructure)) {
      const optionsData = await this.getOptionsData(this.state.filtersToNotUpdate); //Get options of other selected inputs (!= type)
      if (optionsData != null) {
        this.setState({ optionsData, isFetching: false });
      }
    }
  }

  getOptionsData = async (filtersToNotUpdate?: string[]) => {

    const data = new OptionsDataModel();
    const filterIDs: string[] = [];

    // set filterIDs: filters that need to update optionsData (fetch from server)
    Object.keys(this.state.dataStructure).forEach(option => {
      data[option] = this.state.dataStructure[option].selection;
      if (this.state.dataStructure[option].isFilter && !filtersToNotUpdate?.includes(option)) {
        filterIDs.push(option);
      }
    })
    if (filterIDs.length > 0) {
      this.setState({ isFetching: true })
      try {
        const optionsData = await this.props.dataManager.fetchDataFocusOptions({
          data,
          filterIDs
        });
        if (filtersToNotUpdate != null && filtersToNotUpdate?.length > 0) {
          filtersToNotUpdate.forEach(filter => { optionsData[filter] = this.state.optionsData[filter] })
        }
        return optionsData;
      } catch (err) {
        console.error(err);
        return [];
      }
    } else {
      return null
    }

  }

  show = () => {
    this.setState({ visible: true })
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      isFetching: false,
      dataStructure: JSON.parse(JSON.stringify(this.props.dashboard.dataStructure)),
      optionsData: this.state.optionsDataCache
    })
  }

  /**
   * Update data structure state
   * @param dataStructure new data structure
   * @param filtersToNotUpdate filters that not need to be fetched 
   */
  updateDataStructure = (dataStructure, filtersToNotUpdate?: string[]) => {
    this.setState({
      dataStructure, filtersToNotUpdate
    });
  }

  updateDashboardDataStructure = () => {
    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
    dashboard.dataStructure = this.state.dataStructure;
    this.props.updateDashboard(dashboard);
    this.setState({
      visible: false,
      dataStructure: JSON.parse(JSON.stringify(dashboard.dataStructure)),
      optionsDataCache: this.state.optionsData
    })
  }

  handleSubmit = () => {
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

      const selected_in_options = dataStructureData.filter(value => optionsData?.includes(value));
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
          title="Filter all data in the dashboard by :"
          visible={this.state.visible}
          closable={false}
          maskClosable={false}
          zIndex={2}
          okText={'submit'}
          destroyOnClose={true}
          footer={
            <div>
              <Button onClick={this.handleCancel}>Cancel</Button>
              <Button type="primary" onClick={this.handleSubmit}>Submit</Button>
              {this.isDataMissing() && <p style={{ color: "#ff4d4f", margin: "5px 0" }}> <WarningOutlined /> There are missing data in your selection</p>}


            </div>
          }
        >
          <PopupFilterContent
            optionsLabel={this.props.optionsLabel}
            dataStructure={this.state.dataStructure}
            updateDataStructure={this.updateDataStructure}
            optionsData={this.state.optionsData}
            isFetching={this.state.isFetching}
            isDataMissing={this.isDataMissing}
          />
        </Modal >
      </>
    );
  }
}

export default withDataManager(SetupView);