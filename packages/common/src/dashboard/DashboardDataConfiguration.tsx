import React, { Component } from 'react';
import DashboardSelectionControl from './DashboardSelectionControl';

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

    /**
     * 
     * @param data [{model, scenario, variable, region}]
     * @returns the fetched data from API with timeseries
     */
    getData = (data) => {
        data.map(dataElement => {
            if (this.isDataExist(dataElement) === null) {
                this.props.dataManager.fetchData(dataElement).then(resData => {
                    // Check here if data exist or not*
                    if (resData.length !== 0)
                        this.setState({ data: [...this.state.data, resData] });
                })
            }
        });

        return this.settingPlotData(data);
    }

    settingPlotData(data: any[] = []) {
        const plotData: any[] = [];
        data.map(dataElement => {
            const existData = this.isDataExist(dataElement);
            if (existData !== null)
                plotData.push(existData);
        })

        return plotData;
    }


    isDataExist = (reqData) => {
        const data = this.state.data;
        let isExist = null;
        data.map(dataElement => {
            if (dataElement.model === reqData.model &&
                dataElement.scenario === reqData.scenario &&
                dataElement.variable === reqData.variable &&
                dataElement.region === reqData.region) {
                isExist = dataElement //the data already exist
            }
        });
        return isExist;
    }

    render() {
        return <DashboardSelectionControl
            getData={this.getData}
            {...this.props} />
    }
}
