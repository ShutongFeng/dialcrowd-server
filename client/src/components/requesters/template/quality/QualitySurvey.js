import React from "react";
import { Input, Radio, Tooltip, Button } from 'antd'
import { Form } from "antd/lib/index";
import { QuestionCircleOutlined, MinusCircleOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class QualitySurvey extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogs: [], radioConfigure: [] }
  }

  componentDidMount() {
    console.log(this.props.keys2);

    let radioConfigure = new Array(this.props.keys2.slice(-1).pop() + 1).fill(false);

    this.props.keys2.map((k, i) => {
      if (this.props.typeofpoll[k] === "Radio") {
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
    const { keys2, formItemLayout, typeofpoll, pollquestion, example,
      counterexample, instruction, addExample, radio } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    const styleWarning = {
      'width': '90%', 'color': 'darkorange',
      'text-align': 'center',
      'font-weight': 'bold'
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
                <QuestionCircleOutlined /> &nbsp; Tips
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
            label="Type of Question"
          >
            {getFieldDecorator(`typeofpoll[${k}]`,
              {
                initialValue: typeofpoll[k],
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
                      <Tooltip title="Give the system a score from 1 to 5, 1 as strongly disagree and 5 as strongly agree">
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
                Question&nbsp;
                <Tooltip
                  title="After workers talk to your dialog systems, please provide a survey question on how your systems performed.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>)}
            required={true}
          >
            {getFieldDecorator(`pollquestion[${k}]`, {

              initialValue: pollquestion[k],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [{
                required: true,
                whitespace: true,
                message: "Please input the name of the dialog system to show to workers.",
              }],
            })(
              <Input placeholder="How understandable was the system?" style={{ width: '90%', marginRight: 8 }} />
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
                {this.showExample(radio[k], k, 'radio')}
              </FormItem>
              <FormItem {...formItemLayoutWithOutLabel}>
                <Button type="dashed" onClick={() => { addExample(k, 'radio') }} style={{ width: '90%' }}>
                  <PlusOutlined /> Add Radio option
              </Button>
              </FormItem>
            </div> : null}

          <FormItem
            {...(formItemLayout)}
            label={(
              <span>
                Example&nbsp;
                <Tooltip
                  title="Please provide an example of an answer to your question above.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>)}
            required={true}
          >
            {this.showExample(example[k], k, 'example')}
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={() => { addExample(k, 'example') }} style={{ width: '90%' }}>
              <PlusOutlined /> Add Example
            </Button>
            {
              example[k].length >= 4 ?
                <div style={styleWarning}>
                  <ExclamationCircleOutlined /> Adding more than 3 examples is not recommended.
              </div> : null
            }
          </FormItem>
          <FormItem
            {...(formItemLayout)}
            label={(
              <span>
                Counterexample&nbsp;
                <Tooltip
                  title="Please provide an incorrect answer to your question above.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>)}
            required={true}
          >
            {this.showExample(counterexample[k], k, 'counterexample')}
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed"
              onClick={() => { addExample(k, 'counterexample') }}
              style={{ width: '90%' }}>
              <PlusOutlined /> Add Counterexample
            </Button>
            {
              counterexample[k].length >= 4 ?
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
      placeholder = "I understood all of the system utterances."
    }
    else if (exampleType === "counterexample") {
      placeholder = "I had issues and questions about the system utterances that prevented me from understanding anything the system said."
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

export default QualitySurvey
