import React from "react";
import { Input, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined, MinusCircleOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

import { Form } from "antd/lib/index";

const FormItem = Form.Item;


class CategoryLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogs: [] }
  }

  componentDidMount() {
    console.log(this.props.keys2);
  }

  render() {
    const { keys2, formItemLayout,
      classLabel, classExample, classCounterexample,
      addExample, removeExample, instruction } = this.props;
    const { getFieldDecorator } = this.props.form;
    const styleWarning = {
      'width': '90%', 'color': 'darkorange',
      'text-align': 'center',
      'font-weight': 'bold'
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    return <div>
      {this.props.keys2.map((k, i) =>
        <div key={k}
          style={{
            border: "2px solid black",
            margin: "10px",
            padding: 24
          }}
        >
          <FormItem>
            {/* instruction tooltip that show instruction when mouse hovering over it. */}
            <span style={{
              float: "left",
              "margin-bottom": "-30px",
              "margin-top": "-20px"
            }}
              class="instruction-tooltip">
              <Tooltip
                title={instruction}>
                <QuestionCircleOutlined />
                  &nbsp; Tips
              </Tooltip>
            </span>

            <span style={{ float: "right", "margin-bottom": "-30px", "margin-top": "-20px", "margin-right": "-10px" }}>
              {keys2.length > 1 ? (
                <MinusCircleOutlined
                  className="dynamic-delete-button"
                  disabled={keys2.length === 1}
                  onClick={() => this.props.remove(k)}
                />
              ) : null}
            </span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Intent"
          >
            {getFieldDecorator(`classLabel[${k}]`,
              {
                initialValue: classLabel[k],
                rules: [{
                  required: true,
                  message: "Define the intent label"
                }]
              }
            )(
              <Input placeholder="order_food" style={{ width: '90%', marginRight: 8 }} />
            )}
          </FormItem>
          <FormItem
            {...(formItemLayout)}
            label={(
              <span>
                An Example&nbsp;
                <Tooltip title='Providing an example of the intent allows workers to know what is an acceptable answer.'>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            )}
            required={true}
          >
            {this.showExample(classExample[k], k, 'example')}
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={() => { addExample(k, 'example') }} style={{ width: '90%' }}>
              <PlusOutlined /> Add Example
            </Button>
            {
              classExample[k].length >= 4 ?
                <div style={styleWarning}>
                  <ExclamationCircleOutlined /> Adding more than 3 examples is not recommended.
              </div> : null
            }
          </FormItem>
          <FormItem
            {...(formItemLayout)}
            label={(
              <span>
                A Counterexample&nbsp;
                <Tooltip title='Providing a counterexample of the intent allows workers to understand what is an unacceptable answer.'>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            )}
            required={true}
          >
            {this.showExample(classCounterexample[k], k, 'counterexample')}
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={() => { addExample(k, 'counterexample') }} style={{ width: '90%' }}>
              <PlusOutlined /> Add Example
            </Button>
            {
              classCounterexample[k].length >= 4 ?
                <div style={styleWarning}>
                  <ExclamationCircleOutlined /> Adding more than 3 examples is not recommended.
              </div> : null
            }
          </FormItem>
        </div>
      )}
    </div>
  }

  showExample(examples, indexQuestion, exampleType) {
    /** 
     * Render example(s) based on the type of `example[k]`. `example[k]` can
     * a string or an array of string.
     *
     * @param {Array}	examples		Examples. Each element in it is [id {int}, example {string}].
     * @param {int}		indexQuestion	Index of the question which the example(s) is for.
     * @param {string}	exampleType		Either 'example' or 'counterexample'.
     **/
    const { getFieldDecorator } = this.props.form;
    const removeExample = this.props.removeExample;
    const fieldName = exampleType === 'example' ? 'classExample' : 'classCounterexample';

    var placeholder = "";

    if (exampleType === "example") {
      placeholder = "I would like to order a pizza from Domino's."
    }
    else if (exampleType === "counterexample") {
      placeholder = "I want to buy some cleaning supplies."
    }

    // Elements to show
    const children = []
    for (const [indEx, example] of examples) {
      children.push(
        getFieldDecorator(
          `${fieldName}[${indexQuestion}][${indEx}]`, {
          initialValue: example,
          validateTrigger: ['onChange', 'onBlur'],

          rules: [{
            required: true,
            whitespace: true,
            message: "Please input responses to show to workers.",
          }],
        }
        )(
          <Input placeholder={placeholder} style={{ width: '90%', marginRight: 8 }} />
        )
      )
      if (examples.length > 1) {
        children.push(
          <Tooltip>
            <a onClick={
              ((id) => () => { removeExample(indexQuestion, id, exampleType); })(indEx)
            }>
              <MinusCircleOutlined />
            </a>
          </Tooltip>
        )
      }
    }
    return children;
  }

}

export default CategoryLabel
