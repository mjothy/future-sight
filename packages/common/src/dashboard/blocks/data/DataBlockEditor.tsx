import { Component } from 'react';
import {Divider, Row, Switch, Tag, TreeSelect} from 'antd';
import SelectInput from '../utils/SelectInput';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getUnselectedInputOptions } from '../utils/BlockDataUtils';
import BlockDataModel, {versionModel} from "../../../models/BlockDataModel";
require('./DataBlockEditor.css')

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

  clearClick = (option, e) => {
    const dashboard = { ...this.props.dashboard };
    const config = this.props.currentBlock.config;

    const index = config.metaData.selectOrder.indexOf(option);
    if (index >= 0) {
      const selectOrder = [...config.metaData.selectOrder];

      for (let i = index; i < config.metaData.selectOrder.length; i++) {
        selectOrder.splice(selectOrder.indexOf(config.metaData.selectOrder[i]), 1);
        // TODO add condition for controlled inputs
        config.metaData[config.metaData.selectOrder[i]] = [];
      }
      config.metaData.selectOrder = Array.from(new Set<string>([...selectOrder]));
      dashboard.blocks[this.props.currentBlock.id].config = { ...config };
      this.props.updateDashboard(dashboard);
    }

  };

  getMessage = (missing) => {
    let msg = '';
    missing.forEach(value => {
      msg = msg + value + ', ';
    })
    if (msg.length > 0) {
      msg = "No data for: " + msg.slice(0, -2);
    }
    return <><WarningOutlined /> {msg}</>;
  }

  selectDropDownInput = (option, selected) => {
    // In case the block is controlled
    const id = this.props.currentBlock.controlBlock;

    let isControlled = false;
    if (id !== '') {
      const controlBlock = this.props.dashboard.blocks[id].config.metaData;
      if (controlBlock.master[option].isMaster) {
        isControlled = true;
      }
    }

    const metaData = this.props.currentBlock.config.metaData;

    return (
      !isControlled && (
        <div className={selected ? 'transition' : ''}>
          <Row className="width-100">
            <h4>{option} &nbsp;<label className='no-data'> {metaData.selectOrder.length == 4 && this.props.missingData[option].length > 0 && this.getMessage(this.props.missingData[option])}
            </label>
            </h4>
            <SelectInput
              type={option}
              value={metaData[option]}
              options={this.props.optionsData[option]}
              onChange={this.props.onChange}
              isClear={selected}
              onClear={this.clearClick}
              onDropdownVisibleChange={this.props.onDropdownVisibleChange}
            />
          </Row>
        </div>
      )
    );
  };

  controlledInputs = () => {
    const id = this.props.currentBlock.controlBlock;
    const metaData = this.props.currentBlock.config.metaData;
    const controlBlock = this.props.dashboard.blocks[id].config.metaData;
    return Object.keys(controlBlock.master).map((key) => {
      if (controlBlock.master[key].isMaster) {
        return (
          <div className='mt-20'>
            <h4>{key} &nbsp;<label className='no-data'> {metaData.selectOrder.length == 4 && this.props.missingData[key].length > 0 && this.getMessage(this.props.missingData[key])}
            </label>
            </h4>
            {controlBlock[key].length <= 0 ? <div>

              <p><ExclamationCircleOutlined /> No data selected</p>
            </div> : controlBlock[key].map(element => {
              let color = "default";
              if (controlBlock.master[key].values.includes(element)) {
                color = "blue";
              }
              return <Tag key={element} color={color}>{element}</Tag>
            })}
          </div>
        );
      }
    });
  };

  sortByTitle = (a,b) => {
    if (a.title < b.title) {
      return 1;
    }
    if (a.title > b.title) {
      return -1;
    }
    return 0;
  }

  renderSelectVersions = () => {
    const metaData :BlockDataModel = this.props.currentBlock.config.metaData
    let disabled = false
    const versionOptions = this.props.optionsData.versions

    if (!metaData.useVersion) {
      return
    }

    if (metaData.models.length==0 || metaData.scenarios.length==0){
      disabled = true
    }

    const treeData: any[]=[]
    if (versionOptions) {
      for (const model of Object.keys(versionOptions)) {
        const modelChildren: any[] = []
        for (const scenario of Object.keys(versionOptions[model])) {
          const scenarioChildren: any[] = []
          const defaultVersion = versionOptions[model][scenario].default
          for (const version of versionOptions[model][scenario].values) {
            scenarioChildren.push({
              title: version == defaultVersion ? version + " (default)" : version,
              value: JSON.stringify({model, scenario, version})
            })
          }
          modelChildren.push({
            title: scenario,
            value: scenario,
            selectable: false,
            children: scenarioChildren.sort(this.sortByTitle)
          })
        }
        treeData.push({
          title: model,
          value: model,
          selectable: false,
          children: modelChildren
        })
      }
    }

    return (
        <div>
          <Divider/>
          <h4>versions</h4>
          {disabled && <p>Models and scenarios must be selected first</p>}
          <TreeSelect
              showSearch
              style={{ width: '100%' }}
              // value={value}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="Please select versions"
              allowClear
              multiple
              treeDefaultExpandAll
              defaultValue={this.getDefaultTreeSelectValue}
              onChange={this.props.onVersionSelected}
              treeData={treeData}
              disabled={disabled}
          />
        </div>
    )
  }

  getDefaultTreeSelectValue = () => {
    const version_dict: versionModel = this.props.dashboard.blocks[this.props.currentBlock.id].config.metaData.versions
    const defaultValues: string[] = []
    for (const model in version_dict){
      for (const scenario in version_dict[model]){
        for (const version of version_dict[model][scenario]){
          defaultValues.push(JSON.stringify({model, scenario, version}))
        }
      }
    }
    return defaultValues
  }

  render() {
    const metaData = this.props.currentBlock.config.metaData;

    return (
        Object.keys(this.props.optionsData).length>0 &&
          <div>
            <div>
              <span className={"advanced-options-switch"}>
                <span>Advanced options</span>
                <Switch size="small" onChange={this.props.onUseVersionSwitched} defaultChecked={metaData.useVersion}/>
              </span>

              {/* show inputs if they are controlled */}
              {this.props.currentBlock.controlBlock !== '' && (
                <div>
                  <strong>Controlled inputs</strong>
                  {this.controlledInputs()}
                  <Divider />
                </div>
              )}

              {/* show dropdown lists of selected  */}
              {metaData.selectOrder.map((option) =>
                this.selectDropDownInput(option, true)
              )}

              {getUnselectedInputOptions(this.props.currentBlock, this.props.optionsLabel).length>0 && <Divider />}

              {/* show dropdown lists of unselected  */}
              <table className="width-100">
                <tr>
                  {getUnselectedInputOptions(this.props.currentBlock, this.props.optionsLabel).map((option) => (
                    <td key={option}>{this.selectDropDownInput(option, false)}</td>
                  ))}
                </tr>
              </table>
              {this.renderSelectVersions()}
            </div>
          </div>
    );
  }
}
