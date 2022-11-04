import {Component} from 'react';
import {Select, Space} from 'antd';
import DataBlockTableSelection from '../component/DataBlockTableSelection';

const {Option} = Select;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            variables: [],
            regions: [],
        }
    }

    componentDidMount() {
        this.updateDropdownData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.blockSelectedId !== this.props.blockSelectedId) {
            this.updateDropdownData();
        }
    }

    /**
     * Update the options of dropdown lists of variables and regions
     * SHOW only the options when we can find data to visualize
     */
    updateDropdownData = () => {
        const dataStructure = this.props.dashboard.dataStructure;
        const metaData = this.props.currentBlock.config.metaData;

        let variables: string[] = [];
        let regions: string[] = [];
        if (this.isControlled() && this.getControlBlock().config.metaData.master.models.isMaster) {
            const controlBlock = this.getControlBlock();
            const controlBlockMetaData = controlBlock.config.metaData
            Object.keys(controlBlockMetaData.models).forEach((modelKey) => {
                controlBlockMetaData.models[modelKey].forEach((scenarioKey) => {
                    variables.push(...dataStructure[modelKey][scenarioKey].variables);
                    regions.push(...dataStructure[modelKey][scenarioKey].regions);
                });
            });
        } else {
            Object.keys(metaData.models).forEach((modelKey) => {
                metaData.models[modelKey].forEach((scenarioKey) => {
                    variables.push(...dataStructure[modelKey][scenarioKey].variables);
                    regions.push(...dataStructure[modelKey][scenarioKey].regions);
                });
            });
        }
        // Show unique values in dropdown list options
        variables = [...new Set(variables)];
        regions = [...new Set(regions)];

        this.setState({
            variables,
            regions
        })

        // Show selected/default values (check if the selected values exist in the dropdown list options)
        const defaultVariables = metaData.variables.filter((variable: string) => variables.indexOf(variable) >= 0);
        const defaultRegions = metaData.regions.filter((region: string) => regions.indexOf(region) >= 0);

        this.props.updateBlockMetaData({variables: defaultVariables, regions: defaultRegions,}, this.props.currentBlock.id);

    };

    variablesSelectionChange = (selectedVariables: string[]) => {
        this.props.updateBlockMetaData({variables: selectedVariables}, this.props.currentBlock.id);
        this.updateDropdownData();
    };

    regionsSelectionChange = (selectedRegions: string[]) => {
        this.props.updateBlockMetaData({regions: selectedRegions}, this.props.currentBlock.id);
        this.updateDropdownData();
    };

    modelsSelectionChange = (models) => {
        this.props.updateBlockMetaData({models: models}, this.props.currentBlock.id);
        this.updateDropdownData();
    }

    isControlled = () => {
        return this.props.currentBlock.controlBlock != ''
    }

    getControlBlock = () => {
        return this.props.blocks[this.props.currentBlock.controlBlock];
    }

    inputIsMaster = (input) => {
        const controlBlockId = this.props.currentBlock.controlBlock
        return (
            this.isControlled() &&
            this.props.blocks[controlBlockId].config.metaData.master[input].isMaster
        )
    }

    render() {
        //TODO: If controlled, but no control selection, show info message instead
        return (
            <Space direction="vertical" className="width-100">
                <div>
                    <h4>Model & Scenario selection</h4>
                    {
                        this.inputIsMaster("models") ? (<p>That block is controlled by Model/scenario</p>)
                        : (
                            <DataBlockTableSelection
                                {...this.props}
                                onSelectChange={this.modelsSelectionChange}
                            />
                        )
                    }
                </div>
                {/* adding key, because react not updating the defaults value on state change */}
                <div>
                    <h4>Variables selection</h4>
                    <Select
                        mode="multiple"
                        className="width-100"
                        placeholder="Variables"
                        value={this.props.currentBlock.config.metaData.variables}
                        onChange={this.variablesSelectionChange}
                        disabled={this.inputIsMaster('variables')}
                    >
                        {this.state.variables.map((variable) => (
                            <Option key={variable} value={variable}>
                                {variable}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div>
                    <h4>Regions selection</h4>
                    <Select
                        mode="multiple"
                        className="width-100"
                        placeholder="Regions"
                        value={this.props.currentBlock.config.metaData.regions}
                        onChange={this.regionsSelectionChange}
                        disabled={this.inputIsMaster('regions')}
                    >
                        {this.state.regions.map((region) => (
                            <Option key={region} value={region}>
                                {region}
                            </Option>
                        ))}
                    </Select>
                </div>
            </Space>
        );
    }
}
