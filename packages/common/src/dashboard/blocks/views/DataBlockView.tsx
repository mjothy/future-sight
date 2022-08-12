import React, { Component } from 'react'
import PlotlyGraph from '../../graphs/PlotlyGraph'

export default class DataBlockView extends Component<any, any> {
  data: any[] = [];
  constructor(props) {
    super(props);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    this.data = [];
    const metaData = this.props.data.config.metaData;
    console.log("block: ", metaData)
    if (metaData.models && metaData.scenarios && metaData.variables && metaData.regions) {
      console.log("metaData: ", metaData);
      metaData.models.map(model => {
        metaData.scenarios.map(scenario => {
          metaData.variables.map(variable => {
            metaData.regions.map(region => {
              console.log({
                model, scenario, variable, region
              })
              this.props.dataManager.fetchData({
                model, scenario, variable, region
              }).then(res => {
                console.log("res", res);
                if (res) {

                  const obj = {
                    type: "line",
                    x: this.getX(res),
                    y: this.getY(res)
                  };
                  this.data.push(obj);
                }

              })
            })
          })
        })
      })
    }
  }
  getX = (data) => {
    const x: string[] = [];
    data.data.map(d => x.push(d.year))
    return x;
  }

  getY = (data) => {
    const y: string[] = [];
    data.data.map(d => y.push(d.value))
    return y;
  }

  render() {
    return <PlotlyGraph {...this.props} data={this.data} />
  }
}
