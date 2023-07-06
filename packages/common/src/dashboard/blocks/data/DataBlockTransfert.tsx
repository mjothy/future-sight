import React, {Component} from 'react';
import DataBlockView from "./DataBlockView";
import BlockDataModel from "../../../models/BlockDataModel";
import ConfigurationModel from "../../../models/ConfigurationModel";
import LoaderMask from "../utils/LoaderMask";

class DataBlockTransfert extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    this.retrieveData();
  }

  componentDidUpdate(prevProps, prevState) {
    if(
        JSON.stringify(this.getMetaData(this.props.currentBlock))
        !==
        JSON.stringify(this.getMetaData(prevProps.currentBlock))
    ) {
      this.retrieveData();
    }
  }

  retrieveData = () => {
    this.setState({loading: true}, () => {
      this.props.blockData(this.props.currentBlock).then(() => {
        this.setState({loading: false});
      })
    })
  }

  getMetaData = (block) => {
    const config: ConfigurationModel | any = block.config;
    const metaData: BlockDataModel = config.metaData;
    return metaData
  }

  render() {
    let timeseriesData = this.props.plotData[this.props.currentBlock.id]
    if (!timeseriesData) {
      timeseriesData = []
    }
    return <>
      <LoaderMask loading={this.state.loading}/>
      <DataBlockView
        currentBlock={this.props.currentBlock}
        timeseriesData={timeseriesData}
        width={this.props.width}
        height={this.props.height}
        checkDeprecatedVersion={this.props.checkDeprecatedVersion}
      />
    </>
  }
}

export default DataBlockTransfert
