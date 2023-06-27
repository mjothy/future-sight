import { CloseCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tag, Tooltip, TreeSelect } from 'antd'
import React, { Component } from 'react'
const { Option } = Select;

// TODO keep only loading (isFetching and loading have the same behaviour)
// same for label and placeholder
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
    onDeselect?: (type: string, selectedData: string[]) => void;
    loading?: boolean;
    isFetching?: false;
    className?: string;
    placeholder?: string;
    isClosable?: boolean;
    regroupOrphans?: string;
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
                const checkable = (values.length === 1 || this.props.type == "categories"); // Set only Leafs as checkable
                currentNode = { title: values[0], label: values[0], key: values[0], value: values[0], children: [], checkable };
                if (values.length === 1 && this.props.regroupOrphans) {
                    // Regroup orphan nodes under single parent if option enabled
                    let orphanParent = treeData.find((node) => node.label === this.props.regroupOrphans)
                    if(!orphanParent) {
                        orphanParent = {
                            title: this.props.regroupOrphans,
                            label: this.props.regroupOrphans,
                            key: this.props.regroupOrphans,
                            value: this.props.regroupOrphans, children: [], checkable: false };
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
                    const checkable = (i === values.length - 1 || this.props.type == "categories"); // Set only Leafs as checkable
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
                {!this.props.isFetching && this.props.value.map(selectedValue => (
                    !this.props.options?.includes(selectedValue) && (
                        <div key={selectedValue} style={{ color: 'red' }} className={"ant-select-item ant-select-item-option"}>
                            <div className='ant-select-item-option-content'>
                                <ExclamationCircleOutlined /> {selectedValue}
                            </div>
                        </div>
                    )
                ))}
            </div>
        );
    }

    tagRender = (props, isShowValue) => {
        const { value, label, closable, onClose } = props;
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

    /**
     * Customize TreeSelect component
     * @returns TreeSelect
     */
    treeSelect = () => {
        return <Input.Group compact>
            <TreeSelect
                value={this.props.value}
                loading={this.props.loading}
                treeCheckable={true}
                placeholder={this.props.label || this.props.type}
                onChange={(selectedData: any[]) =>
                    this.props.onChange(this.props.type, selectedData.map((data: any) => data.value != null ? data.value : data))
                }
                treeData={this.splitOptions(this.props.options)}
                tagRender={(props) => this.tagRender(props, true)}
                treeCheckStrictly={true}
                showCheckedStrategy={"SHOW_ALL"}
                treeDefaultExpandedKeys={this.props.regroupOrphans ? [this.props.regroupOrphans] : undefined}
                className={this.props.className}
                onDropdownVisibleChange={(e) =>
                    this.props.onDropdownVisibleChange?.(this.props.type, e)
                }
                onDeselect={(selectedData) => this.props.onDeselect?.(this.props.type, selectedData.map((data: any) => data.value))}
                dropdownMatchSelectWidth={false}
                notFoundContent={(this.props.isFetching) ? (
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
                value={this.props.value}
                loading={this.props.loading}
                treeCheckable={true}
                placeholder={this.props.label || this.props.type}
                onChange={(selectedData: any[]) =>
                    this.props.onChange(this.props.type, selectedData.map((data: any) => data.value != null ? data.value : data))
                }
                tagRender={(props) => this.tagRender(props, false)} // false: show only the value of selected leaf
                showCheckedStrategy={"SHOW_CHILD"}
                className={this.props.className}
                onDropdownVisibleChange={(e) =>
                    this.props.onDropdownVisibleChange?.(this.props.type, e)
                }
                onDeselect={(selectedData) => this.props.onDeselect?.(this.props.type, selectedData.map((data: any) => data.value))}
                dropdownMatchSelectWidth={false}
                notFoundContent={(this.props.isFetching) ? (
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
                {this.renderTreeNodes(this.splitOptions(this.props.options))}

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
                    mode="multiple"
                    className={this.props.className}
                    dropdownRender={this.dropdownRender} // TODO
                    tagRender={(props) => this.tagRender(props, true)} // TODO
                    placeholder={this.props.label || this.props.type}
                    value={this.props.value}
                    loading={this.props.loading}
                    onChange={(selectedData) => {
                        return this.props.onChange(this.props.type, selectedData)
                    }}
                    // on close: save data
                    onDropdownVisibleChange={(e) => {
                        return this.props.onDropdownVisibleChange?.(this.props.type, e)
                    }
                    }
                    dropdownMatchSelectWidth={false}
                    notFoundContent={(this.props.isFetching) ? (
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
                    {this.props.options?.map((value) => (
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
            case "categories": return this.treeSelectLeafOnly();
            case "variables":
            case "regions": return this.treeSelect();
            default: return this.defaultSelect();
        }
    }
}
