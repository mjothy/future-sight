import { CloseCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tag, Tooltip, TreeSelect } from 'antd'
import React, { Component } from 'react'
const { Option } = Select;

interface SelectOptionProps {
    /**
     * The data option, it could be models, scenarios , ...
     */
    type: string;
    label?: string;
    value: string[];
    options: any;
    onChange: (type: string, selectedData: string[]) => void;
    isClear?: boolean;
    onClear?: (type, e) => void;
    onDropdownVisibleChange?: (option: string, e: any) => void;
    enabled?: boolean;
    onDeselect?: (type: string, selectedData: string[]) => void;
    loading?: boolean;
    className?: string;
    isClosable?: boolean;
    regroupOrphans?: string;
    disableMultiSelect?: boolean;
}

const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUE_STYLE = {};

export default class SelectInput extends Component<SelectOptionProps, any> {

    constructor(props) {
        super(props);
        this.state = { searchValue: "" }
    }

    splitOptions = (options) => {
        const treeData: any[] = [];

        options?.forEach((option) => {
            const values = option.split('|');

            let currentNode = treeData.find((node) => node.label === values[0]);

            // Set the first element
            if (!currentNode) {
                const checkable = (values.length === 1); // Set only Leafs as checkable
                currentNode = { title: values[0], label: values[0], key: values[0], value: values[0], children: [], checkable };
                if (values.length === 1 && this.props.regroupOrphans) {
                    // Regroup orphan nodes under single parent if option enabled
                    let orphanParent = treeData.find((node) => node.label === this.props.regroupOrphans)
                    if (!orphanParent) {
                        orphanParent = {
                            title: this.props.regroupOrphans,
                            label: this.props.regroupOrphans,
                            key: this.props.regroupOrphans,
                            value: this.props.regroupOrphans, children: [], checkable: false
                        };
                        treeData.push(orphanParent);
                    }
                    orphanParent.children.push(currentNode);
                } else {
                    treeData.push(currentNode);
                }
            }

            // Set other element (children)
            for (let i = 1; i < values.length; i++) {
                let childNode = currentNode.children.find((node) => node.label === values[i]);
                if (!childNode) {
                    const checkable = (i === values.length - 1); // Set only Leafs as checkable
                    const value = values.slice(0, i + 1).join('|');
                    childNode = { title: values[i], label: values[i], key: value, value, children: [], checkable };
                    currentNode.children.push(childNode);
                } else {
                    if (!childNode.checkable) {
                        childNode.checkable = i === values.length - 1;
                    }
                }

                if (currentNode.children.length > 0) {
                    currentNode.title = `${currentNode.label} (${currentNode.children.length})`
                }
                currentNode = childNode;
            }

        });

        return treeData;
    }

    dropdownRender = (menu) => {
        return (
            <div>
                {menu}
            </div>
        );
    }

    tagRender = (props, isShowValue) => {
        const { value, label, onClose } = props;
        return (
            <Tag
                color={this.props.options?.includes(value) ? undefined : 'red'}
                closable={this.props.isClosable}
                onClose={onClose}
                icon={this.props.options?.includes(value) ? undefined : <ExclamationCircleOutlined />}
                className={this.props.options?.includes(value) ? 'ant-select-selection-item' : 'ant-select-selection-item data-missing-tag'}
            >
                <label className='ant-select-selection-item-content' style={VALUE_STYLE[value]}>{isShowValue ? value : label}</label>
            </Tag>
        );
    }

    onSearch = (searchValue) => {
        this.setState({ searchValue });
    }

    onChange = (selectedData: string[]) => {
        let data = selectedData;
        if(this.props.disableMultiSelect && data.length > 0){
            data = data.slice(-1);
        }
        this.props.onChange(this.props.type, data.map((element: any) => element.value != null ? element.value : element));// when TreeSelect selecteData is object {value, key}
    }

    /**
     * Customize TreeSelect component
     * @returns TreeSelect
     */
    treeSelect = () => {
        return <Input.Group compact>
            <TreeSelect
                className={"fsselectinput " + this.props.className}
                value={this.props.value}
                loading={this.props.loading}
                treeCheckable={true}
                placeholder={this.props.label || this.props.type}
                onChange={this.onChange}
                treeData={this.props.loading ? undefined : this.splitOptions(this.props.options)}
                tagRender={(props) => this.tagRender(props, true)}
                treeCheckStrictly={true}
                showCheckedStrategy={"SHOW_ALL"}
                treeDefaultExpandedKeys={this.props.regroupOrphans ? [this.props.regroupOrphans] : undefined}
                onDropdownVisibleChange={(e) =>
                    this.props.onDropdownVisibleChange?.(this.props.type, e)
                }
                disabled={this.props.enabled == false}
                onDeselect={(selectedData) => this.props.onDeselect?.(this.props.type, selectedData.map((data: any) => data.value))}
                dropdownMatchSelectWidth={false}
                notFoundContent={(this.props.loading) ? (
                    <div>
                        <LoadingOutlined />
                        <p>Fetching data</p>
                    </div>
                ) : (
                    <div>
                        <ExclamationCircleOutlined /> This item does not exists for your filter selections.
                    </div>
                )}
                treeExpandAction="doubleClick"
                onSearch={this.onSearch}
                searchValue={this.state.searchValue}
                dropdownRender={this.dropdownRender}
            />
            {this.props.isClear && <Tooltip title="Clear">
                <Button
                    type="default"
                    onClick={(e) => this.props.onClear?.(this.props.type, e)}

                    icon={<CloseCircleOutlined />}
                />
            </Tooltip>}
        </Input.Group>
    }

    /**
     *
     * @param treeData Customize the node (option) in TreeSelect component
     * @param color Text color
     * @returns Tree node (option in TreeSelect component)
     */
    renderTreeNodes = (treeData, color?: string) => {
        return treeData.map((item, key) => {
            let colorNode = color;
            if (colorNode == null) {
                colorNode = COLORS[key % COLORS.length];
            }
            item.style = {
                color: colorNode,
            }
            VALUE_STYLE[item.value] = item.style
            if (item.children) {
                return (
                    <TreeSelect.TreeNode title={item.title} key={item.key} value={item.value} style={item.style}>
                        {this.renderTreeNodes(item.children, colorNode)}
                    </TreeSelect.TreeNode>
                );
            }
            return <TreeSelect.TreeNode {...item} key={item.key} />;
        });
    }

    treeSelectLeafOnly = () => {
        return <Input.Group compact>
            <TreeSelect
                treeDataSimpleMode={ this.props.disableMultiSelect }
                value={this.props.value}
                loading={this.props.loading}
                treeCheckable={true}
                placeholder={this.props.label || this.props.type}
                onChange={this.onChange}
                tagRender={(props) => this.tagRender(props, false)} // false: show only the value of selected leaf
                showCheckedStrategy={"SHOW_CHILD"}
                className={"fsselectinput " + this.props.className}
                onDropdownVisibleChange={(e) =>
                    this.props.onDropdownVisibleChange?.(this.props.type, e)
                }
                onDeselect={(selectedData) => this.props.onDeselect?.(this.props.type, selectedData.map((data: any) => data.value))}
                dropdownMatchSelectWidth={false}
                notFoundContent={(this.props.loading) ? (
                    <div>
                        <LoadingOutlined />
                        <p>Fetching data</p>
                    </div>
                ) : (
                    <div>
                        <ExclamationCircleOutlined /> This item does not exists for your filter selections.
                    </div>
                )}
                treeExpandAction="doubleClick"
                onSearch={this.onSearch}
                searchValue={this.state.searchValue}
            >
                {this.props.loading ? undefined : this.renderTreeNodes(this.splitOptions(this.props.options))}

            </TreeSelect>
            {this.props.isClear && <Tooltip title="Clear">
                <Button
                    type="default"
                    onClick={(e) => this.props.onClear?.(this.props.type, e)}
                    icon={<CloseCircleOutlined />}
                />
            </Tooltip>}
        </Input.Group>
    }

    defaultSelect = () => {
        return (
            <Input.Group compact>
                <Select
                    mode={"multiple"}
                    className={"fsselectinput " + this.props.className}
                    dropdownRender={this.dropdownRender} // TODO
                    tagRender={(props) => this.tagRender(props, true)} // TODO
                    placeholder={this.props.label || this.props.type}
                    value={this.props.value}
                    loading={this.props.loading}
                    onChange={this.onChange}
                    // on close: save data
                    onDropdownVisibleChange={(e) => {
                        return this.props.onDropdownVisibleChange?.(this.props.type, e)
                    }
                    }
                    disabled={this.props.enabled == false}
                    dropdownMatchSelectWidth={false}
                    notFoundContent={(this.props.loading) ? (
                        <div>
                            <LoadingOutlined />
                            <p>Fetching data</p>
                        </div>
                    ) : (
                        <div>
                            <ExclamationCircleOutlined /> This item does not exists for your filter selections.
                        </div>
                    )}
                >
                    {this.props.loading ? undefined : this.props.options?.map((value) => (
                        <Option key={value} value={value}>
                            {value}
                        </Option>
                    ))}
                </Select>
                {this.props.isClear && <Tooltip title="Clear">
                    <Button
                        type="default"
                        onClick={(e) => this.props.onClear?.(this.props.type, e)}

                        icon={<CloseCircleOutlined />}
                    />
                </Tooltip>}
            </Input.Group>
        )

    }

    render() {
        switch (this.props.type) {
            case "variables":
            case "regions": return this.treeSelect();
            default: return this.defaultSelect();
        }
    }
}
