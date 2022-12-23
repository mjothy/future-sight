import {AreaChartOutlined, BarChartOutlined, LineChartOutlined, TableOutlined} from '@ant-design/icons';
import {Col, Input, Row, Select, Checkbox} from 'antd';
import {Component} from 'react';
import FiltersDefinitionModel from "../../../models/FiltersDefinitionModel";

const { Option } = Select;

const plotTypes = [
  {type: 'line', label: 'Line', icon: <LineChartOutlined/>},
  {type: 'bar', label: 'Bar', icon: <BarChartOutlined />},
  {type: 'area', label: 'Area', icon: <AreaChartOutlined />},
  {type: 'table', label: 'Table', icon: <TableOutlined />},
];

export default class DataBlockVisualizationEditor extends Component<any, any> {

  onPlotTypeChange = (selectedType: string) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.graphType = selectedType;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onTitleChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.title.value = e.target.value;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onTitleVisibilityChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.title.isVisible = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onLegendChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.showLegend = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  };

  onLegendContentChange = (checkedValues) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    for (const key in configStyle.legend){
      configStyle.legend[key]=false
    }
    for (const value of checkedValues) {
      configStyle.legend[value] = true;
    }
    this.updateBlockConfig({ configStyle })
  };

  legendOptions = () => {
    return Object.values(this.props.filtersDefinition as FiltersDefinitionModel)
        .map(
            (filter) => { return { "label": filter.id_singular, "value": filter.id_singular } }
    );
  }

  onYAxisLabelChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.label = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onYAxisUnitChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.unit = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }

  onYAxisForceChange = (e) => {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    configStyle.YAxis.force0 = e.target.checked;
    this.updateBlockConfig({ configStyle: configStyle })
  }


  updateBlockConfig = (configStyle) => {
    const dashboard = { ...this.props.dashboard };
    const config = dashboard.blocks[this.props.currentBlock.id].config;
    dashboard.blocks[this.props.currentBlock.id].config = { ...config, ...configStyle };
    this.props.updateDashboard(dashboard)
  }
  render() {
    const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
    const legend = this.props.currentBlock.config.configStyle.legend;
    const defaultLegendOptions: any[] = [];
    for (const key in legend) {
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
              placeholder="Type de graphique"
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
