import React from 'react';
import {Input, Button} from 'antd';
import { SketchPicker, ChromePicker } from 'react-color';

class ColorPicker extends React.Component {
  /* Args:
     form
     {@String} name: name of the input field.
     {@String} initialValue:
     {@String} previewText
   */
  constructor (props) {
    super(props);
    this.state = {
      visiblePicker: false,
      color: this.props.initialValue
    };
    this.color = this.props.initialValue;
  }

  handleClick = () => {
    this.setState(
      { visiblePicker: !this.state.visiblePicker }
    );
  };

  componentDidUpdate (prevProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.setState({color: this.props.initialValue});
    }
  }
  
  close () {
    this.setState({
      visiblePicker: false,
    });
    if (this.color !== undefined) {
      this.setState({
        color: this.color.hex
      });
      this.props.form.setFieldsValue(
        {[this.props.name]: this.color.hex.toUpperCase()}
      );
    }
  };

  handleChange (e) {
    e.preventDefault();
    this.setState({color: e.target.value});
  }
  
  render() {
    const {getFieldDecorator} = this.props.form;
    let colorStyle;
    if (this.props.previewText === undefined) {
      colorStyle = {
        background: this.state.color,
        color: this.state.color,
        "border-style": "solid",
        "border-width": "1px",
        "margin-left": "5px",
        "border-color": "#BBBBBB"
      };
    } else {
      colorStyle = {
        color: this.state.color,
      };
    }
    
    return (<>
      {this.showPicker()}
      <div>
        {getFieldDecorator(this.props.name, {
          initialValue: this.state.color,
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please specify a color.",
          }],
          onChange: (e) => this.handleChange(e)
        })(
          <Input placeholder="#000000"
                 style={{width: "20%"}}
                 onClick={this.handleClick}
          />
        )}
        <span style={colorStyle}>{this.props.previewText || "⬤"}</span>
      </div>
    </>);
  }

  handleColorChange (color, event) {
    this.color = color;
  }
  
  showPicker () {
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
        <div style={ popover }>
          <div style={ inner }>
            <SketchPicker
              color={this.state.color}
              onChangeComplete={(color) => this.handleColorChange(color)}
            />
            <Button onClick={() => this.close()}
                    style={{width: "100%"}}>Done
            </Button>
          </div>
        </div>
      </>);
    } else {
      return null;
    }
  }
}

export default ColorPicker;
