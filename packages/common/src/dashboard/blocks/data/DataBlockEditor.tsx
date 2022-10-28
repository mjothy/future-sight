import {Component} from 'react';
import {Select, Space} from 'antd';
import DataBlockTableSelection from '../component/DataBlockTableSelection';

//TODO variable selection do not change because currentBlock doesn't change
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
        // the second condition to not update the dropdown list of ControlData
        if (
            prevProps.blockSelectedId !== this.props.blockSelectedId &&
            this.props.currentBlock.blockType === 'data'
        ) {
            this.updateDropdownData();
        }
    }

    /**
     * Update the options of dropdown lists of variables and regions
     * SHOW only the options when we can find data to visualize
     */
    updateDropdownData = () => {
        const dataStructure = this.props.dashboard.dataStructure;
        let variables: string[] = [];
        let regions: string[] = [];
        const metaData = this.props.currentBlock.config.metaData;

        // Not controlled block allow selection of only selected model
        if (!this.props.currentBlock.controlBlock) {
            Object.keys(metaData.models).map((modelKey) => {
                metaData.models[modelKey].map((scenarioKey) => {
                    variables.push(...dataStructure[modelKey][scenarioKey].variables);
                    regions.push(...dataStructure[modelKey][scenarioKey].regions);
                });
            });
        //  Controlled block allow selection of regions and variables of all model from control block
        } else {
            const controlBlockMetaData = this.props.blocks[this.props.currentBlock.controlBlock].config.metaData
            Object.keys(controlBlockMetaData.models).map((modelKey) => {
                controlBlockMetaData.models[modelKey].map((scenarioKey) => {
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
        const defaultVariables = metaData.variables
            .filter((variable: string) => variables.indexOf(variable) >= 0);
        const defaultRegions = metaData.regions
            .filter((region: string) => regions.indexOf(region) >= 0);

        this.props.updateBlockMetaData({
            variables: defaultVariables,
            regions: defaultRegions,
        });

    };

    variablesSelectionChange = (selectedVariables: string[]) => {
        this.props.updateBlockMetaData({variables: selectedVariables});
        this.updateDropdownData();
    };

    regionsSelectionChange = (selectedRegions: string[]) => {
        this.props.updateBlockMetaData({regions: selectedRegions});
        this.updateDropdownData();
    };

    inputIsMaster = (input) => {
        const controlBlockId = this.props.currentBlock.controlBlock
        console.log(controlBlockId)
        console.log(!!controlBlockId)
        return (
            !!controlBlockId &&
            this.props.blocks[controlBlockId].config.metaData.master[input].isMaster
        )
    }

    render() {


        return (
            <Space direction="vertical" className="width-100">
                <div>
                    <h4>Model & Scenario selection</h4>
                    {
                        this.inputIsMaster("models")
                        ? (<p>That block is controlled by Model/scenario</p>)
                        : (
                            <DataBlockTableSelection
                                {...this.props}
                                updateDropdownData={this.updateDropdownData}
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
