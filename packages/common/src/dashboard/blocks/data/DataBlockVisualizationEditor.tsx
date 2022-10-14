import {AreaChartOutlined, BarChartOutlined, LineChartOutlined, TableOutlined} from '@ant-design/icons';
import {Col, Input, Row, Select} from 'antd';
import Checkbox from 'antd/es/checkbox';
import {Component} from 'react';

const { Option } = Select;
const ATTRIBUTES = {
  Region: {

  },
  Variable: {

  },
  Scenario: {

  },
  Model : {

  }
}

const plotTypes = [
  {type: 'line', label: 'Line', icon: <LineChartOutlined/>},
  {type: 'bar', label: 'Bar', icon: <BarChartOutlined />},
  {type: 'area', label: 'Area', icon: <AreaChartOutlined />},
  {type: 'table', label: 'Table', icon: <TableOutlined />},
];

export default class DataBlockVisualizationEditor extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      configStyle :  this.props.currentBlock.config.configStyle
    }
  }

  onPlotTypeChange = (selectedType: string) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.graphType = selectedType;
    this.props.updateBlockStyleConfig(configStyle);
  };

  onTitleChange = (e) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.title.value = e.target.value;
    this.props.updateBlockStyleConfig(configStyle);
  };

  onTitleVisibilityChange = (e) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.title.isVisible = e.target.checked;
    this.props.updateBlockStyleConfig(configStyle);
  };

  onLegendChange = (e) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.showLegend = e.target.checked;
    this.props.updateBlockStyleConfig(configStyle);
  };

  onLegendContentChange = (checkedValues) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.legend = {
      Model: false,
      Scenario: false,
      Region: false,
      Variable: false
    }
    for (let value of checkedValues) {
      configStyle.legend[value] = true;
    }
    this.props.updateBlockStyleConfig(configStyle);
  };

  legendOptions = () => {
    return Object.keys(ATTRIBUTES).map((att) => { return { "label": att, "value": att } });
  }

  onYAxisLabelChange = (e) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.label = e.target.checked;
    this.props.updateBlockStyleConfig(configStyle);
  }

  onYAxisUnitChange = (e) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.unit = e.target.checked;
    this.props.updateBlockStyleConfig(configStyle);
  }

  onYAxisForceChange = (e) => {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.force0 = e.target.checked;
    this.props.updateBlockStyleConfig(configStyle);
  }

  render() {
    let configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    let legend = this.props.currentBlock.config.configStyle.legend;
    let defaultLegendOptions : any[] = [];
    for (let key of Object.keys(legend)) {
      if (legend[key]) {
        defaultLegendOptions.push(key);
      }
    }
    return (
      <div>
        <h3>General</h3>
        <Row className="mb-10">
          <Col span={2} />
          <Col span={16}>
            <Select
              className="width-100"
              placeholder="Variables"
              value={configStyle.graphType}
              onChange={this.onPlotTypeChange}
            >
              {plotTypes.map((chart) => (
                <Option key={chart.type} value={chart.type}>
                  {chart.icon} {chart.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
              onChange={this.onTitleVisibilityChange}
              checked={configStyle.title.isVisible}
            />
          </Col>
          <Col span={16}>
            <Input
              placeholder="Title"
              value={configStyle.title.value}
              onChange={this.onTitleChange}
            />
          </Col>
        </Row>
        <h3>Axis</h3>
        <Row>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
                onChange={this.onYAxisForceChange}
                checked={configStyle.YAxis.force0}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Range of Y axis to 0</label>
          </Col>
        </Row>
        <Row>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
                onChange={this.onYAxisLabelChange}
                checked={configStyle.YAxis.label}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Show Y Axis label</label>
          </Col>
        </Row>
        <Row>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
                onChange={this.onYAxisUnitChange}
                checked={configStyle.YAxis.unit}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Show Y Axis unit</label>
          </Col>
        </Row>
        <h3>Legend</h3>
        <Row>
          <Col span={2} className={'checkbox-col'}>
            <Checkbox
              onChange={this.onLegendChange}
              checked={configStyle.showLegend}
            />
          </Col>
          <Col span={16} className={'checkbox-col-label'}>
            <label>Show legend</label>
          </Col>
        </Row>
        <Row>
          <Col span={2}/>
          <Col span={8}>
            <label>Legend info: </label>
          </Col>
        </Row>
        <Row>
          <Col span={2}/>
          <Col>
            <Checkbox.Group options={this.legendOptions()} value={defaultLegendOptions} onChange={this.onLegendContentChange} />
          </Col>
        </Row>
      </div>
    );
  }
}
