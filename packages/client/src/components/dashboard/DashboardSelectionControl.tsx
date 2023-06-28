import {
  BlockModel,
  blocksIdToDelete,
  compareDataStructure,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  DashboardModel,
  LayoutModel,
  PlotDataModel,
} from '@future-sight/common';
import {Component} from 'react';
import {RoutingProps} from '../app/Routing';

import DashboardView from './DashboardView';
import {getDraft, setDraft} from '../drafts/DraftUtils';
import {notification, Spin} from 'antd';

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager,
  RoutingProps {
  saveData: (id: string, image?: string) => Promise<any>;
  allData: any;
  plotData: PlotDataModel[];
  blockData: (block: BlockModel) => void;
  optionsLabel: string[];
}

export default class DashboardSelectionControl extends Component<
  DashboardSelectionControlProps,
  any
> {
  constructor(props) {
    super(props);
    this.state = this.initialize()
  }

  initialize() {
    // Check first if dashboard in draft
    const state = {
      dashboard: {},
      /**
       * The selected block id
       */
      blockSelectedId: '',
      isDraft: false,
    };
    const w_location = window.location.pathname;
    if (w_location.includes('draft')) {
      const locationSearch = window.location.search;
      const params = new URLSearchParams(locationSearch);
      const id = params.get('id');
      const dashboardJson: any = getDraft(id);
      if (dashboardJson) {
        state.dashboard = dashboardJson;
        state.isDraft = true;
      } else {
        console.error('no draft found with id' + id);
      }

    }

    return state;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dashboard != this.state.dashboard) {
      setDraft(this.state.dashboard.id, this.state.dashboard);
    }
  }

  getLastId = () => {
    const dashboardJson = this.state.dashboard;
    let lastId = 0;
    if (Object.keys(dashboardJson.blocks).length > 0) {
      lastId = Math.max(...Object.keys(dashboardJson.blocks).map((key => parseInt(key))));
    }
    return lastId;
  };

  updateSelectedBlock = (blockSelectedId: string) => {
    this.setState({ blockSelectedId });
  };

  copyBlock = (blockSelectedId: string) => {
    const layoutItem = new LayoutModel((this.getLastId() + 1).toString());
    const dashboard = this.state.dashboard;

    const newBlock = Object.assign({}, this.state.dashboard.blocks[blockSelectedId])
    newBlock.id = layoutItem.i
    dashboard.blocks[layoutItem.i] = newBlock;
    dashboard.layout = [layoutItem, ...dashboard.layout];

    const state = {
      dashboard: {
        ...this.state.dashboard,
        blocks: dashboard.blocks,
        layout: dashboard.layout,
      },
      blockSelectedId: layoutItem.i
    };
    this.setState(state);
  }

  updateDashboard = (dashboard: DashboardModel) => {
    const isUpdateDataStructure = compareDataStructure(this.state.dashboard.dataStructure, dashboard.dataStructure);
    if (isUpdateDataStructure) {
      // Update dataStructure (Data focus)
      const newDataStructure = dashboard.dataStructure;
      const toDeleteBlocks = blocksIdToDelete(Object.values(this.state.dashboard.blocks), newDataStructure);
      const blockAndLayouts = this.deleteBlocks(Array.from(toDeleteBlocks));
      dashboard = { ...dashboard, ...blockAndLayouts }
    }
    this.setState({ dashboard })
  }

  addBlock = (blockType: string, masterBlockId?: string) => {
    const layoutItem = new LayoutModel((this.getLastId() + 1).toString());
    const dashboard = this.state.dashboard;

    dashboard.blocks[layoutItem.i] = new BlockModel(layoutItem.i, blockType);
    dashboard.layout = [layoutItem, ...dashboard.layout];

    if (masterBlockId) {
      dashboard.blocks[layoutItem.i].controlBlock = masterBlockId;
      const master = dashboard.blocks[masterBlockId].config.metaData.master;
      Object.keys(master).forEach((option) => {
        if (master[option].isMaster) {
          dashboard.blocks[layoutItem.i].config.metaData.selectOrder =
            Array.from(
              new Set([
                ...dashboard.blocks[layoutItem.i].config.metaData.selectOrder,
                option,
              ])
            );
          dashboard.blocks[layoutItem.i].config.metaData[option] =
            master[option].values;
        }
      });
    }

    const state = {
      dashboard: {
        ...this.state.dashboard,
        blocks: dashboard.blocks,
        layout: dashboard.layout,
      },
      blockSelectedId: layoutItem.i
    };
    this.setState(state);
  };

  deleteBlocks = (blocksId: string[]) => {
    const blocks = { ...this.state.dashboard.blocks };
    let layout = [...this.state.dashboard.layout];
    blocksId.forEach(blockId => {

      // delete childs
      if (blocks[blockId] !== undefined && blocks[blockId].blockType === "control") {
        const blockChilds = Object.values(blocks).filter((block: BlockModel | any) => block.controlBlock === blockId).map((block: BlockModel | any) => block.id);
        blockChilds.forEach(id => {
          delete blocks[id];
          layout = layout.filter((element) => element.i !== id);
        });
      }

      delete blocks[blockId]
      layout = layout.filter((element) => element.i !== blockId);

    })

    this.setState({ blockSelectedId: '' })

    const blocksAndLayouts = {
      blocks: blocks,
      layout: layout,
    }

    return blocksAndLayouts;
  };

  saveData = async (callback?: (idPermanent) => void, image?: string) => {
    const { id } = this.state.dashboard;
    const idPermanent = await this.props.saveData(id, image);
    if (callback) {
      callback(idPermanent);
    }
  };

  /**
   * Check if data in selection (selected data) are present in Select options
   * Add default version to metadata.versions
  */
  checkIfSelectedInOptions = (optionsData, block: BlockModel) => {
    let optionsLabel = [...this.props.optionsLabel];
    const dashboard = { ...this.state.dashboard };
    const config = block.config as ConfigurationModel;
    const metaData = JSON.parse(JSON.stringify(((block.config) as ConfigurationModel).metaData));
    let isDashboardUpdated = false;
    const missingData = {}
    optionsLabel = optionsLabel.filter(key => key != "categories"); // TODO delete after
    optionsLabel.forEach(option => {
      if (option == "versions") {return}
      // Check if selected data (metaData[option]) are in options of drop down list
      const dataInOptionsData = metaData[option].filter(data => optionsData[option].includes(data));
      if (dataInOptionsData.length < metaData[option].length) {
        isDashboardUpdated = true;
        missingData[option] = metaData[option].filter(data => !optionsData[option].includes(data));
        metaData[option] = dataInOptionsData;
        if (metaData[option].length === 0) {
          metaData.selectOrder = metaData.selectOrder.filter(option1 => option1 !== option);
        }
      }
    });

    if (
        metaData.selectOrder.includes("models")
        && metaData.selectOrder.includes("scenarios")
    ){ // check if selected version exists in new version dictionary
      let dataInOptionsData = []

      // Remove versions that do not exists
      for(const model of Object.keys(metaData["versions"])){
        for(const scenario of Object.keys(metaData["versions"][model])) {
          dataInOptionsData = metaData["versions"][model][scenario].filter(
              data => optionsData["versions"]?.[model]?.[scenario]?.values
                  .map(tempVersionDict => tempVersionDict.id)
                  .includes(data.id)
          );
          if (dataInOptionsData.length < metaData["versions"][model][scenario].length) {
            isDashboardUpdated = true;
            metaData["versions"][model][scenario] = dataInOptionsData;
          }
        }
      }

      // add default versions to metadata if no version is selected
      for(const model in optionsData["versions"]){
        for(const scenario in optionsData["versions"][model]) {
          if (!metaData["versions"][model]){
            (metaData["versions"][model] = {});
          }
          if (!metaData["versions"][model][scenario]) {
            isDashboardUpdated = true;
            metaData["versions"][model][scenario] = [optionsData["versions"][model][scenario].default]
          }
        }
      }

    } else { // Models or scenarios not filled so remove versions
      if(Object.keys(metaData["versions"]).length>0){
        isDashboardUpdated = true;
        metaData["versions"]={}
      }
    }

    if (isDashboardUpdated) {
      const dashboard = JSON.parse(JSON.stringify(this.state.dashboard));
      dashboard.blocks[block.id as string].config.metaData = { ...metaData };
      this.updateDashboard(dashboard);
      Object.keys(missingData).length>0 && notification.warning({
        message: 'Options removed from selection box',
        description: (<div dangerouslySetInnerHTML={{ __html: this.notifDesc(missingData) }}></div>),
        placement: 'bottomRight',
      });
    }
  }

  notifDesc = (missingData) => {
    let notif = "Some selected options are not available with new filters: <br/>";
    Object.keys(missingData).forEach(key => {
      if (missingData[key].length > 0) {
        let msg = '';
        missingData[key].forEach(value => {
          msg = msg + value + ', ';
        })

        notif = notif + key + ': ' + msg + '<br/>';
      }
    })

    return notif;
  }

  render() {
    if (!this.state.dashboard) {
      return (
        <div className="dashboard">
          <Spin className="centered" />
        </div>
      );
    }
    return (
      <DashboardView
        dashboard={this.state.dashboard}
        addBlock={this.addBlock}
        copyBlock={this.copyBlock}
        blockSelectedId={this.state.blockSelectedId}
        updateSelectedBlock={this.updateSelectedBlock}
        updateDashboard={this.updateDashboard}
        saveDashboard={this.saveData}
        deleteBlocks={this.deleteBlocks}
        checkIfSelectedInOptions={this.checkIfSelectedInOptions}
        isDraft={this.state.isDraft}
        {...this.props}
      />
    );
  }
}
