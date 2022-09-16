import { FilterOutlined } from '@ant-design/icons'
import { Col, Divider, Row, Select } from 'antd'
import { Option } from 'antd/lib/mentions'
import React, { Component } from 'react'

const filterOptions = ["Regions", "Variables", "Scenarios", "Models"]
export default class PopupFilterContent extends Component<any, any> {
    regions: string[] = [];
    variables: string[] = [];
    scenarios: string[] = [];
    models: string[] = [];

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // fetching data
        this.props.dataManager.fetchRegions().then(regions => this.regions = regions);
        this.props.dataManager.fetchVariables().then(variables => this.variables = variables);
        this.props.dataManager.fetchScenarios().then(scenarios => this.scenarios = scenarios);
        this.props.dataManager.fetchModels().then(models => this.models = models);
    }
    
    render() {
        const dataStructure = {...this.props.dataStructure};

        const onFilterChange = (filter: string) => {
            filter = filter.toLowerCase();
            // tHE KEY can be: models/scenarios/regions/variables
            Object.keys(dataStructure).map(key => {
                if (filter === key) {
                    dataStructure[key].isFilter = true;
                } else {
                    dataStructure[key].isFilter = false;
                    dataStructure[key].selection = [];
                }
            })
            // reset other date
            this.props.updateDataStructure(dataStructure);
            this.props.updateSelectedFilter(filter);
        }

        const onRegionsChange = (regions: string[]) => {
            dataStructure.regions.selection = regions;
            this.props.updateDataStructure(dataStructure);

        }

        const onVariablesChange = (variables: string[]) => {
            dataStructure.variables.selection = variables;
            this.props.updateDataStructure(dataStructure);

        }

        const onScenariosChange = (scenarios: string[]) => {
            dataStructure.scenarios.selection = scenarios;
            this.props.updateDataStructure(dataStructure);

        }

        const onModelsChange = (models: string[]) => {
            dataStructure.models.selection = models;
            this.props.updateDataStructure(dataStructure);

        }

        return (
            <div>
                <Row className="mb-10" justify='center'>
                    <Col span={20}>
                        <Select
                            className="width-100"
                            placeholder="Select your filter"
                            value={this.props.selectedFilter}
                            onChange={onFilterChange}
                            suffixIcon={<FilterOutlined />}
                        >
                            {filterOptions.map((option) => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Divider />
                <Row className="mb-10" justify='center'>
                    <Col span={20}>
                        {this.props.selectedFilter === "regions" && <Select
                            mode="multiple"
                            className="width-100"
                            placeholder="Regions"
                            value={dataStructure.regions.selection}
                            onChange={onRegionsChange}
                        >
                            {this.regions.map((option) => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>}
                        {this.props.selectedFilter === "variables" && <Select
                            mode="multiple"
                            className="width-100"
                            placeholder="Variables"
                            value={dataStructure.variables.selection}
                            onChange={onVariablesChange}
                        >
                            {this.variables.map((option) => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>}
                        {this.props.selectedFilter === "scenarios" && <Select
                            mode="multiple"
                            className="width-100"
                            placeholder="Scenarios"
                            value={dataStructure.scenarios.selection}
                            onChange={onScenariosChange}
                        >
                            {this.scenarios.map((option) => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>}
                        {this.props.selectedFilter === "models" && <Select
                            mode="multiple"
                            className="width-100"
                            placeholder="Models"
                            value={dataStructure.models.selection}
                            onChange={onModelsChange}
                        >
                            {this.models.map((option) => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>}
                    </Col>
                </Row>
            </div>
        )
    }
}
