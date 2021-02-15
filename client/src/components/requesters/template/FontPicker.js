import React from 'react';
import { Input, InputNumber, Button, Select, Radio, Tooltip } from 'antd';
import {
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  FontColorsOutlined, FontSizeOutlined, LineHeightOutlined
} from '@ant-design/icons';
import { SketchPicker } from 'react-color';

class FontPicker extends React.Component {
  /* Args:
     form
     {@Array} keys: Path to the config. e.g ['style', 'instruction'].
     {@Function} updateByKey: 
     {@String} fontFamily
     {@String} fontSize
     {@String} color
     {@String} previewText
   */
  constructor(props) {
    super(props);
    this.state = {
      visiblePicker: false,
    };
    this.color = this.props.color;
  }

  handleClick = () => {
    this.setState(
      { visiblePicker: !this.state.visiblePicker }
    );
  };

  close() {
    // close color picker
    this.setState({
      visiblePicker: false
    });

    // update parent state
    if (this.color !== undefined) {
      this.props.updateByKey(this.props.keys, { color: this.color.hex.toUpperCase() });

      // update text in the input
      const path = this.props.keys.concat(['color']);
      const colorFieldName = path2Name(path);
      this.props.form.setFieldsValue(
        { [colorFieldName]: this.color.hex.toUpperCase() }
      );
    }
  };

  handleColorInputChange(e) {
    /* Update parent state when the input box is changed */
    e.preventDefault();
    const path = this.props.path.concat(['color']);
    const colorFieldName = path2Name(path);
    this.props.form.setFieldsValue(
      { [colorFieldName]: this.color.hex.toUpperCase() }
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const stylePreviewText = {
      color: this.props.color,
      "fontFamily": this.props.fontFamily,
      "fontSize": `${this.props.fontSize}pt`,
      "padding-left": "0.5em",
      "vertical-align": "middle",
      display: 'inline-block',
      width: '40%'
    };
    const fontList = [
      'Helvetica',
      'Arial',
      'Times New Roman',
      'Impact',
      'Times',
      'Arial Black'
    ];
    const prefix = path2Name(this.props.keys);
    return (<>
      {this.showPicker()}
      <div>
        {/* color */}
        <Tooltip title="Text color.">
          <FontColorsOutlined
            style={{ marginLeft: "0.5em", marginRight: "0.5em", color: this.props.color }} />
        </Tooltip>
        {getFieldDecorator(prefix + "['color']", {
          initialValue: this.props.color || "#000000",
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please specify a color.",
          }],
          onChange: (e) => this.handleColorInputChange(e)
        })(
          <Input placeholder="#000000"
            style={{
              width: "1em", height: "1em",
              color: 'transparent', background: this.props.color
            }}
            onClick={this.handleClick}
          />
        )}

        {/* font-size */}
        <Tooltip title="Font size.">
          <FontSizeOutlined style={{ marginLeft: "1em", marginRight: "0.5em" }} />
        </Tooltip>
        {getFieldDecorator(prefix + "['fontSize']", {
          initialValue: `${this.props['fontSize'] || 12}`,
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please specify the size.",
          }],
          onChange: (n) => this.props.updateByKey(
            this.props.keys, { "fontSize": n }
          )
        })(
          <InputNumber style={{ width: "4em" }} />
        )}

        {/* line height */}
        <Tooltip title="Line height.">
          <LineHeightOutlined style={{ marginLeft: "1em", marginRight: "0.5em" }} />
        </Tooltip>
        {getFieldDecorator(prefix + "['lineHeight']", {
          initialValue: `${this.props['lineHeight'] || 1.5}`,
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please specify the line hight.",
          }],
        })(
          <InputNumber step={0.25} style={{ width: "4em" }} />
        )}

        {/* font-family */}
        <span style={{ marginRight: "0.5em" }}></span>
        {getFieldDecorator(prefix + "['fontFamily']", {
          initialValue: this.props.fontFamily || 'Helvetica',
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please specify the font.",
          }],
          onChange: (value) => this.props.updateByKey(
            this.props.keys, { 'fontFamily': value }
          )
        })(
          <Select defaultValue={this.state.family}
            style={{ width: "15%", "fontFamily": this.props.fontFamily }}>
            {fontList.map(
              (font, i) => (
                <Select.Option
                  value={font} key={i}
                  style={{ "font-family": font }}>
                  {font}
                </Select.Option>
              )
            )}
          </Select>
        )}

        {/* align */}
        <span style={{ marginRight: "0.5em" }}></span>
        {getFieldDecorator(prefix + "['text-align']", {
          initialValue: this.props['textAlign'] || 'left',
          /* onChange: (value) => this.props.updateByKey(
           *   this.props.keys, {textAlign: value}
           * ) */
        })(
          <Radio.Group>
            <Radio.Button value="left" style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}>
              <AlignLeftOutlined />
            </Radio.Button>
            <Radio.Button value="center" style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}>
              <AlignCenterOutlined />
            </Radio.Button>
            <Radio.Button value="right" style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}>
              <AlignRightOutlined />
            </Radio.Button>
          </Radio.Group>
        )}
        <span style={stylePreviewText}>{this.props.previewText || "preview"}</span>
      </div>
    </>);
  }

  handleColorPickerChange(color, event) {
    this.color = color;
  }

  showPicker() {
    const popover = {
      position: 'absolute',
      zIndex: '2',
    };

    const inner = {
      left: 0,
      bottom: 0,
      position: 'absolute'
    };

    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };

    if (this.state.visiblePicker) {
      return (<>
        <div style={popover}>
          <div style={inner}>
            <SketchPicker
              color={this.state.color}
              onChangeComplete={(color) => this.handleColorPickerChange(color)}
            />
            <Button onClick={() => this.close()}
              style={{ width: "100%" }}>Done
            </Button>
          </div>
        </div>
      </>);
    } else {
      return null;
    }
  }
}


function path2Name(path) {
  /* Convert a path to name of a form item. 
     Args:
     {@Array} path
     Return: {@String}
   */
  let name = "";
  for (const v of path) {
    name = name + `['${v}']`;
  }
  return name;
}

export default FontPicker;

