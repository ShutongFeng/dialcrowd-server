import React from "react";
import { Input, Tooltip, Button } from 'antd'
import { MinusCircleOutlined, ExclamationCircleOutlined, QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Form } from "antd/lib/index";

const FormItem = Form.Item;


class SequenceLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogs: [] }
  }

  componentDidMount() {
  }

  render() {
    const { keys2, formItemLayout, Label, Example,
      Counterexample, addExample, removeExample, instruction } = this.props;
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
      {keys2.map((k, i) =>
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
            label="Type"
          >
            {getFieldDecorator(`Label[${k}]`,
              {
                initialValue: Label[k],
                rules: [{
                  required: true,
                  message: "Define Type"
                }]
              }
            )(
              <Input placeholder="Noun" style={{ width: '90%', marginRight: 8 }} />
            )}
          </FormItem>
          <FormItem
            {...(formItemLayout)}
            label={(
              <span>
                An Example&nbsp;
                <Tooltip title='Providing an example of the entity type allows workers to know what you are looking for.'>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            )}
            required={true}
          >
            {this.showExample(Example[k], k, 'example')}
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={() => { addExample(k, 'example') }} style={{ width: '90%' }}>
              <PlusOutlined /> Add Example
            </Button>
            {
              Example[k].length >= 4 ?
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
                <Tooltip title='Providing a counterexample of the entity type allows workers to know what you are looking for.'>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            )}
            required={true}
          >
            {this.showExample(Counterexample[k], k, 'counterexample')}
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={() => { addExample(k, 'counterexample') }} style={{ width: '90%' }}>
              <PlusOutlined /> Add Example
            </Button>
            {
              Counterexample[k].length >= 4 ?
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
    const fieldName = exampleType === 'example' ? 'Example' : 'Counterexample';

    // Elements to show
    const children = [];
    for (const [indEx, example] of examples) {
      children.push(
        getFieldDecorator(
          `${fieldName}[${indexQuestion}][${indEx}]`, {
          initialValue: example,
          validateTrigger: ['onChange', 'onBlur'],

          rules: [{
            required: true,
            whitespace: true,
            message: `Please input ${exampleType} labels to show to workers.`,
          }],
        }
        )(
          exampleType === 'example' ?
            <Input placeholder='Cat' style={{ width: '90%', marginRight: 8 }} />
            : <Input placeholder='Walk' style={{ width: '90%', marginRight: 8 }} />
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

export default SequenceLabel
