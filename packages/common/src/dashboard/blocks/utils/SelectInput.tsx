import { CloseCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tag, Tooltip, TreeSelect } from 'antd'
import React, { Component } from 'react'
const { Option } = Select;

interface SelectOptionProps {
    /**
     * The data option, it could be models, scenarios , ...
     */
    type: string;
    value: string[];
    options: any;
    onChange: (type: string, selectedData: string[]) => void;
    isClear?: boolean;
    onClear?: (type, e) => void;
    onDropdownVisibleChange?: (option: string, e: any) => void;
    onDeselect?: (type: string, selectedData: string[]) => void;
    isFetching?: false;
    className?: string;
}

export default class SelectInput extends Component<SelectOptionProps, any> {

    constructor(props) {
        super(props);
        this.state = { searchValue: "" }
    }

    splitOptions = (options) => {
        const treeData: any[] = [];

        options.forEach((option) => {
            const values = option.split('|');

            let currentNode = treeData.find((node) => node.label === values[0]);

            // Set the first element
            if (!currentNode) {
                const checkable = (values.length === 1 || this.props.type == "categories"); // Set only Leafs as checkable
                currentNode = { title: values[0], label: values[0], key: values[0], value: values[0], children: [], checkable };
                currentNode.title = `${currentNode.label} (${currentNode.children.length})`;
                treeData.push(currentNode);
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
                        const checkable = i === values.length - 1;
                        childNode.checkable = checkable;
                    }
                }

                currentNode.title = `${currentNode.label} (${currentNode.children.length})`;
                currentNode = childNode;
            }

        });

        return treeData;
    }

    // getCategoriesOptions = (options) => { // for categorie: {value:string, children:string[]}
    //     const trees: any[] = []

    //     options.forEach(element => {
    //         const newElement: any = {};
    //         newElement.title = element.value;
    //         newElement.key = element.value;
    //         newElement.value = element.value;
    //         const childs: any[] = [];
    //         element.children?.forEach((child: string) => {
    //             childs.push({ value: child, title: child, key: child })
    //         });

    //         newElement.children = childs;
    //         trees.push(newElement)
    //     });

    //     console.log("trees: ", trees);
    //     return trees;
    // }

    dropdownRender = (menu) => {
        return (
            <div>
                {menu}
                {!this.props.isFetching && this.props.value.map(selectedValue => (
                    !this.props.options.includes(selectedValue) && (
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

    tagRender = (props) => {
        const { value, closable, onClose } = props;
        return (
            <Tag
                color={this.props.options.includes(value) ? undefined : 'red'}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
                icon={this.props.options.includes(value) ? undefined : <ExclamationCircleOutlined />}
                className={this.props.options.includes(value) ? 'ant-select-selection-item tag-selection-item' : 'ant-select-selection-item tag-selection-item data-missing-tag'}
            >
                <label className='ant-select-selection-item-content'>{value}</label>
            </Tag>
        );
    }

    tagRenderCategories = (props) => {
        const { value, closable, onClose } = props;
        return (
            <Tag
                color={this.props.options.includes(value) ? undefined : 'red'}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
                icon={this.props.options.includes(value) ? undefined : <ExclamationCircleOutlined />}
                className={this.props.options.includes(value) ? 'ant-select-selection-item tag-selection-item' : 'ant-select-selection-item tag-selection-item data-missing-tag'}
            >
                <label className='ant-select-selection-item-content'>{value}</label>
            </Tag>
        );
    }

    onSearch = (searchValue) => {
        this.setState({ searchValue });
    }

    treeSelect = () => {
        return <Input.Group compact>
            <TreeSelect
                value={this.props.value}
                treeCheckable={true}
                placeholder={this.props.type}
                onChange={(selectedData: any[]) =>
                    this.props.onChange(this.props.type, selectedData.map((data: any) => data.value != null ? data.value : data))
                }
                treeData={this.splitOptions(this.props.options)}
                tagRender={this.props.type == "categories" ? this.tagRenderCategories : this.tagRender}
                treeCheckStrictly={this.props.type != "categories"}
                showCheckedStrategy={this.props.type == "categories" ? "SHOW_CHILD" : "SHOW_ALL"}
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
            // status={this.props.value.length <= 0 ? "error" : ""}
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

    defaultSelect = () => {
        return <Input.Group compact>
            <Select
                mode="multiple"
                className={this.props.className}
                dropdownRender={this.dropdownRender}
                tagRender={this.tagRender}
                placeholder={this.props.type}
                value={this.props.value}
                onChange={(selectedData) =>
                    this.props.onChange(this.props.type, selectedData)
                }
                // on close: save data
                onDropdownVisibleChange={(e) =>
                    this.props.onDropdownVisibleChange?.(this.props.type, e)
                }
                onDeselect={(selectedData) => this.props.onDeselect?.(this.props.type, selectedData)}
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
                onSearch={this.onSearch}
                searchValue={this.state.searchValue}
            // status={this.props.value.length <= 0 ? "error" : ""}
            >
                {!this.props.isFetching && this.props.options.map((value) => (
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
    }

    render() {
        switch (this.props.type) {
            case "categories":
            case "variables":
            case "regions": return this.treeSelect();
            default: return this.defaultSelect();
        }
    }
}
