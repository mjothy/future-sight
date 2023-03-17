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
    getNswatches = () => {
        const metaData = this.props.currentBlock.config.metaData;
        const configStyle = this.props.currentBlock.config.configStyle;

        let n = 1;
        this.props.optionsLabel.forEach(key => {
            n = n * metaData[key].length;
        });

        return n != 0 ? n : configStyle.colorscale.lenght;
    }
    render() {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        const nSwatches = this.getNswatches();
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
                    colorscale={configStyle.colorscale}
                    onClick={() => {
                        // 
                    }}
                />
                Toggle Colorscale Picker
            </div>
                {this.state.showColorscalePicker &&
                    <ColorscalePicker
                        onChange={this.onColorsChange}
                        colorscale={configStyle.colorscale}
                        nSwatches={nSwatches}
                        disableSwatchControls
                    />
                }</div>
        )
    }
}
