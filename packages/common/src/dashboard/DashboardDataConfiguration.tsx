import React, { Component } from 'react'
import BlockModel from '../models/BlockModel';
import Dashboard from './Dashboard'

/**
 * To dispatch the data to all blocks of dashboard
 */
export default class DashboardDataConfiguration extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            /**
             * Data (with timeseries from IASA API)
             */
            data: []
        }
    }

    componentDidMount() {
        // fetch all data of all blocks
        // fIX THAT /!\ get the dashboard on the props
        // this.props.dataManager.getDashboard().then(data => {
        //     const blocks = data.blocks;
        //     Object.values(blocks).map((block: BlockModel | any) => {
        //         const metaData = block.config.metaData;
        //         const variables = metaData.variables;
        //         const regions = metaData.regions;
        //         const models = metaData.models;
        //         Object.keys(models).map(modelKey => {
        //             const scenarios = models[modelKey];
        //             scenarios.map(scenario => {
        //                 variables.map(variable => {
        //                     regions.map(region => {
        //                         const reqData = {
        //                             model: modelKey,
        //                             scenario,
        //                             variable,
        //                             region
        //                         };

        //                         if (!this.isDataExist(reqData)) {
        //                             this.props.dataManager.fetchData(reqData).then(resData => {
        //                                 this.setState({ data: [...this.state.data, resData] });
        //                             })
        //                         }
        //                     })
        //                 })
        //             })
        //         })
        //         // console.log("metaData: ", metaData);
        //     })
        // })
    }

    isDataExist = (reqData) => {
        const data = this.state.data;
        let isExist = false;
        data.map(dataElement => {
            console.log(dataElement.model +"==="+ reqData.model +" /// "+
                dataElement.scenario +"==="+ reqData.scenario +" /// "+
                dataElement.variable +"==="+ reqData.variable +" /// "+
                dataElement.region +"==="+ reqData.region)
            if (dataElement.model === reqData.model &&
                dataElement.scenario === reqData.scenario &&
                dataElement.variable === reqData.variable &&
                dataElement.region === reqData.region)

                {
                    console.log("enter here");
                    isExist = true //the data already exist
            }
        });
        return isExist;
    }
    dashboardDataUpdate = () => {
        if(this.props.blockSelectedId !== null){
            const block = this.props.dashboard.blocks[this.props.blockSelectedId];
                const metaData = block.config.metaData;
                const variables = metaData.variables;
                const regions = metaData.regions;
                const models = metaData.models;
                Object.keys(models).map(modelKey => {
                    const scenarios = models[modelKey];
                    scenarios.map(scenario => {
                        variables.map(variable => {
                            regions.map(region => {
                                const reqData = {
                                    model: modelKey,
                                    scenario,
                                    variable,
                                    region
                                };

                                console.log(this.isDataExist(reqData))
                                if (!this.isDataExist(reqData)) {
                                    console.log("data not exist ! ");
                                    this.props.dataManager.fetchData(reqData).then(resData => {
                                        this.setState({ data: [...this.state.data, resData] });
                                    })
                                }
                            })
                        })
                    })
                })
            // console.log("metaData: ", metaData);
    }
    
    }
    render() {
        return <Dashboard
            dashboardDataUpdate={this.dashboardDataUpdate}
            data={this.state.data}
            {...this.props} />
    }
}
