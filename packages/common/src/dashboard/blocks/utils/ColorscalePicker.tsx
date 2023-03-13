import React, { Component } from 'react'
import { Colorscale } from 'react-colorscales';
import ColorscalePicker from 'react-colorscales';
import { COLOR_PICKER_CONSTANTS } from 'react-colorscales';

COLOR_PICKER_CONSTANTS.COLORSCALE_TYPES = ["sequential", "divergent", "categorical"];

export default class ColorscalePicker extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            showColorscalePicker: false
        }
    }
    onColorsChange = colorscale => {
        this.props.onColorsChange(colorscale);
    }
    toggleColorscalePicker = () => {
        this.setState({ showColorscalePicker: !this.state.showColorscalePicker });
    }
    render() {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);

        const toggleButtonStyle = { cursor: 'pointer' };
        if (this.state.showColorscalePicker) {
            toggleButtonStyle["borderColor"] = '#A2B1C6';
        }
        return (
            <div>                <div
                onClick={this.toggleColorscalePicker}
                className='toggleButton'
                style={toggleButtonStyle}
            >
                <Colorscale
                    colorscale={configStyle.colorbar.colorscale}
                    onClick={() => {
                        // 
                    }}
                />
                Toggle Colorscale Picker
            </div>
                {this.state.showColorscalePicker &&
                    <ColorscalePicker
                        onChange={this.onColorsChange}
                        colorscale={configStyle.colorbar.colorscale}
                        nSwatches={configStyle.colorbar.colorscale.length}
                        disableSwatchControls
                    />
                }</div>
        )
    }
}
