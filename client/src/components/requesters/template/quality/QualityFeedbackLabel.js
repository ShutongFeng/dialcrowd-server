import React from "react";
import { Input, Radio, Tooltip, Button } from 'antd'
import { Form } from "antd/lib/index";
import { MinusCircleOutlined, QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons'

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class QualityFeedbackLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogs: [], radioConfigure: [] }
  }

  componentDidMount() {
    console.log(this.props.keys);

    let radioConfigure = new Array(this.props.keys.slice(-1).pop() + 1).fill(false);

    this.props.keys.map((k, i) => {
      if (this.props.feedbackType[k] === "Radio") {
        radioConfigure[k] = true
      }
    })

    this.setState({
      radioConfigure: radioConfigure
    })
  }

  radioChange = (e) => {
    let x = this.state.radioConfigure
    if (e.target.value === "Radio") {
      x[parseInt(e.target.name)] = true
    }
    else {
      x[parseInt(e.target.name)] = false
    }

    this.setState({
      radioConfigure: x
    })
  }

  render() {
    const { keys, formItemLayout, feedback, feedbackType,
      instruction, feedbackradio, addExample } = this.props;
    const { getFieldDecorator } = this.props.form;

    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

    return <div>
      {this.props.keys.map((k, i) =>
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
                <QuestionCircleOutlined /> &nbsp; Tips
              </Tooltip>
            </span>

            <span style={{ float: "right", "margin-bottom": "-30px", "margin-top": "-20px", "margin-right": "-10px" }}>
              {keys.length > 1 ? (
                <MinusCircleOutlined
                  className="dynamic-delete-button"
                  disabled={keys.length === 1}
                  onClick={() => this.props.remove(k)}
                />
              ) : null}
            </span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Type of Question"
          >
            {getFieldDecorator(`feedbackType[${k}]`,
              {
                initialValue: feedbackType[k],
                rules: [{
                  required: true,
                  message: "Select one of them"
                }]
              }
            )(
              <RadioGroup onChange={this.radioChange} name={k.toString()}>
                <Radio value="Likert Scale">
                  <span>
                    Likert Scale&nbsp;
                      <Tooltip title="Give the question a score from 1 to 5.">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                </Radio>
                <Radio value="Open ended">
                  <span>
                    Open Ended&nbsp;
                      <Tooltip title="Require more thought and more than a simple one-word answer">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                </Radio>
                <Radio value="Radio">
                  <span>
                    Multiple Choice&nbsp;
                      <Tooltip title="Multiple choice">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                </Radio>
              </RadioGroup>
            )}
          </FormItem>

          <FormItem
            {...(formItemLayout)}
            label={(
              <span>
                Feedback Question&nbsp;
                <Tooltip title='Asking workers for feedback can greatly improve your HIT.'>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            )}
            required={true}
          >
            {getFieldDecorator(`feedback[${k}]`, {

              initialValue: feedback[k],
              validateTrigger: ['onChange', 'onBlur'],

              rules: [{
                required: true,
                whitespace: true,
                message: "Please input feedback to ask of workers.",
              }],
            })(
              <Input placeholder="Feedback" style={{ width: '90%', marginRight: 8 }} />
            )}
          </FormItem>

          {this.state.radioConfigure[k] ?
            <div>
              <FormItem
                {...(formItemLayout)}
                label={(
                  <span>
                    Radio Option&nbsp;
                    <Tooltip
                      title="Please provide an example of an answer to your question above.">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>)}
                required={true}
              >
                {this.showExample(feedbackradio[k], k, 'feedbackradio')}
              </FormItem>
              <FormItem {...formItemLayoutWithOutLabel}>
                <Button type="dashed" onClick={() => { addExample(k, 'feedbackradio') }} style={{ width: '90%' }}>
                  <PlusOutlined /> Add Radio option
              </Button>
              </FormItem>
            </div> : null}

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
    const { removeExample } = this.props;

    // Deal with cases where there is only one example and `examples` is not array.
    /* examples = Array.isArray(examples) ? examples : [examples]; */

    // Elements to show
    const children = []
    let newexamples = [];
    if (examples === undefined) {
      newexamples.push([[0, ""]])
    }
    else {
      newexamples = examples.slice();
    }

    var placeholder = "";

    if (exampleType === "example") {
      placeholder = "I had no issues or questions about any of the sentences/questions."
    }
    else if (exampleType === "counterexample") {
      placeholder = "I had issues and questions that prevented me from completing the task."
    }
    else {
      placeholder = "Yes"
    }

    if (newexamples !== undefined && newexamples.length > 0) {
      for (const [indEx, example] of newexamples) {
        children.push(
          getFieldDecorator(
            `${exampleType}[${indexQuestion}][${indEx}]`, {
            initialValue: example,
            validateTrigger: ['onChange', 'onBlur'],

            rules: [{
              required: true,
              whitespace: true,
              message: "Please input some text.",
            }],
          }
          )(
            <Input placeholder={placeholder} style={{ width: '90%', marginRight: 8 }} />
          )
        )
        if (newexamples.length > 1) {
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
    }
    return children;
  }

}

export default QualityFeedbackLabel
