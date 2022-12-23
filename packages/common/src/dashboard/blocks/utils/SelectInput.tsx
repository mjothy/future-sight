import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tooltip } from 'antd'
import React, { Component } from 'react'

const Option = Select.Option;

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
}

export default class SelectInput extends Component<SelectOptionProps, any> {
    render() {
        return (
            <Input.Group compact>
                <Select
                    mode="multiple"
                    className={"width-90"}
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
                    notFoundContent={(
                        <div>
                            <ExclamationCircleOutlined />
                            <p>This item does not exists for your filter selections.</p>
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
}
