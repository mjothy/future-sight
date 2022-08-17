import React, { Component } from 'react'
import PlotlyGraph from '../../graphs/PlotlyGraph'

export default class DataBlockView extends Component<any, any> {
  data: any[] = [];
  constructor(props) {
    super(props);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
  this.settingPlotData();
  }
  componentDidMount(){
    this.settingPlotData();
  }

  settingPlotData(){
    const data:any[] = [];
    const metaData = this.props.currentBlock.config.metaData;
    if (metaData.models && metaData.variables && metaData.regions) {
      Object.keys(metaData.models).map(model => {
        metaData.models[model].map(scenario => {
          metaData.variables.map(variable => {
            metaData.regions.map(region => {
             
              this.props.data.map(dataElement =>{
                if(dataElement.model === model &&
                  dataElement.scenario === scenario &&
                  dataElement.variable === variable &&
                  dataElement.region === region )
                  {const obj = {
                  type: "line",
                  x: this.getX(dataElement),
                  y: this.getY(dataElement),
                  name: model +'/'+scenario,
                  showlegend: true
                };
                data.push(obj);}
              })
            })
          })
        })
      })
    }

    return data;
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
    console.log("this.data: ", this.data);
    return <PlotlyGraph {...this.props} data={this.settingPlotData()} />
  }
}
