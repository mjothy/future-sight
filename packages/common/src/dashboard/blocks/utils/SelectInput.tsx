import { CloseCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tag, Tooltip } from 'antd'
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
}

export default class SelectInput extends Component<SelectOptionProps, any> {
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
        const { label, value, closable, onClose } = props;
        return (
            <Tag
                color={this.props.options.includes(label) ? undefined : 'red'}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
                icon={this.props.options.includes(label) ? undefined : <ExclamationCircleOutlined />}
                className={"ant-select-selection-item tag-selection-item"}
            >
                <label className='ant-select-selection-item-content'>{label}</label>
            </Tag>
        );
    }

    render() {
        return (
            <Input.Group compact>
                <Select
                    mode="multiple"
                    className={"width-90"}
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
                            <ExclamationCircleOutlined />
                            <p>This item does not exists for your filter selections.</p>
                        </div>
                    )}
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
        )
    }
}
