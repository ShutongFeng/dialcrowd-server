import React from "react";
import { Button, Form, Input, Radio, Tooltip } from 'antd';
import { QuestionCircleOutlined, PlusOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'


function test(questions, types, optionss,
  exampless = undefined, counterexampless = undefined) {
}


function lists2Questions(queries, types, optionss,
  exampless = undefined, counterexampless = undefined) {
  const _addKey = (xs) => (xs.map((x, i) => ({ 'key': i, 'content': x })));

  let questions = []
  for (let i = 0; i < queries.length; i += 1) {
    if (exampless !== undefined) {
      // Workaround: in case exampless[i] is not an array.
      let examples = Array.isArray(exampless[i]) ? exampless[i] : [exampless[i]];
      let counterexamples = (
        Array.isArray(exampless[i]) ? counterexampless[i] : [counterexampless[i]]
      );

      questions.push({
        "key": i,
        "title": queries[i],
        "type": types[i],
        "options": (
          optionss[i] === null ? [{ key: 0, content: "" }] : _addKey(optionss[i])
        ),
        "examples": _addKey(examples),
        "counterexamples": _addKey(counterexamples),
      });
    } else {
      questions.push({
        "key": i,
        "title": queries[i],
        "type": types[i],
        "options": _addKey(optionss[i])
      });
    }
  }
  return questions;
}


function addKeys(questions) {
  const _addKey = (xs) => (
    xs.map(
      (x, i) => ({ key: i, content: x })
    )
  );
  let newQuestions = [];
  for (let [i, question] of questions.entries()) {
    let newQuestion = {};
    // add key to arrays in the question
    for (let k in question) {
      if (Array.isArray(question[k])) {
        newQuestion[k] = _addKey(question[k]);
      } else {
        newQuestion[k] = question[k];
      }
    }
    // add key to the question itself
    newQuestion["key"] = i;

    newQuestions.push(newQuestion);
  }
  return newQuestions;
}


class QuestionList extends React.Component {
  /* Props:
   * @{object}	form:
   * @{style}	formItemLayout:
   * @{Array} questions [
   *    {
   *        'key': @{int},
   *        'title': @{string},
   *        'type': @{string},
   *        'options': [{'key': @{int} key, 'content': @{string}}, ... ]
   *        'examples': [{'key': @{int} key, 'content': @{string}}, ... ]
   *        'counterexamples': [{'key': @{int} key, 'content': @{string}}, ... ]
   *    }, ...
   * ]
   * @{string} questionFieldLabel: default `Question`.
   * @{string} fieldNameQuestion: HTML form name for the field of the question.
   * @{string} questionHelpText: Like "After workers talk to your dialog systems,"
   * @{string} textAddQuestion: Text to show on the add question button.
   * @{string} textInstruction: Text to show in the "tip" tooltip.
   * "please provide a survey question on how your systems performed."
   * @{function} removeByKey: Function that can remove a element by id.
   * @{function} addByKey: Function that can remove a element by id.
   * @{function} updateByKey: Function that can update a element by id.
   * @{string} placeholderQuestion: 
   * @{string} placeholderExample: 
   * @{string} placeholderCounterexample: 
   * @{string} placeholderOption: 
   */
  constructor(props) {
    super(props);
    this.questionTypes = [
      ["Voting", "A/B tests", "Select the best system."],
      ["Likert Scale", "Likert Scale",
        "Give the system a score from 1 to 5, 1 as strongly disagree and 5 as strongly agree."],
      ["Open ended", "Open ended",
        "Require more thought and more than a simple one-word answer."],
      ["Radio", "Multiple Choice",
        "Multiple choice, write your question, then separate your question and each answer with"
        + " the '|' character without extra spaces in between."]
    ];
    this.formItemLayout = props.formItemLayout;
    this.formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    this.styleWarning = {
      'width': '90%', 'color': 'darkorange',
      'text-align': 'center',
      'font-weight': 'bold'
    };
  }

  render() {
    return (
      <>
        {this.props.questions.map(
          (question) => (this._renderQuestionSection(question))
        )}
        <Form.Item {...this.formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this._addQuestion} style={{ width: '90%' }}>
            <PlusOutlined /> {this.props.textAddQuestion}
          </Button>
        </Form.Item>
      </>
    );
  }

  _addQuestion = () => {
    this.props.addByKey(
      [this.props.fieldNameQuestion],
      {
        "question": "",
        "type": this.questionTypes[0][0],
        "options": [{ "key": 0, "content": "" }],
        "examples": [{ "key": 0, "content": "" }],
        "counterexamples": [{ "key": 0, "content": "" }]
      }
    );
  };

  _renderQuestionSection(question) {
    switch (this.props.listStyle || 'box') {
      case 'box':
        return (
          <div key={question.key}
            style={{ border: "2px solid black", margin: "10px", padding: 24 }} >
            {this._renderQuestionBody(question)}
          </div>
        );
      default: {
        throw `Unsupported listStyle ${this.props.listStyle}`;
      }
    }
  }

  _renderQuestionBody(question) {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        {/* instruction tooltip that show instruction when mouse hovering over it. */}
        <span style={{
          float: "left",
          "margin-bottom": "-30px"
        }}
          class="instruction-tooltip">
          <Tooltip
            title={this.props.textInstruction}>
            <QuestionCircleOutlined /> &nbsp; Tips
          </Tooltip>
        </span>

        {/* Remove question button. */}
        <Form.Item>
          <span style={{ float: "right", "margin-bottom": "-30px", "margin-top": "-20px", "margin-right": "-10px" }}>
            {this.props.questions.length > 1 ? (
              <MinusCircleOutlined
                className="dynamic-delete-button"
                disabled={this.props.questions.length === 1}
                onClick={() => this.props.removeByKey(
                  [this.props.fieldNameQuestion, question.key]
                )}
              />
            ) : null}
          </span>
        </Form.Item>

        {/* Type of question. */}
        <Form.Item {...this.formItemLayout} label="Type of Question">
          {getFieldDecorator(
            `${this.props.fieldNameQuestion}[${question.key}]["type"]`,
            {
              initialValue: question.type,
              rules: [{
                required: true,
                message: "Select one of them"
              }]
            }
          )(
            <Radio.Group onChange={
              (e) => {
                this.props.updateByKey(
                  [this.props.fieldNameQuestion, question.key],
                  { type: e.target.value }
                )
              }}
              name={question.key.toString()}>
              {this.questionTypes.map(
                ([value, description, explanation]) => (
                  <Radio value={value}>
                    <span>
                      {description} &nbsp;
                      <Tooltip title={explanation}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  </Radio>
                )
              )}
            </Radio.Group>
          )}
        </Form.Item>

        {/* Questions */}
        <Form.Item {...(this.formItemLayout)}
          label={(
            <span>
              {this.props.questionFieldLabel || "Question"} &nbsp;
              <Tooltip title={this.props.questionHelpText}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>)}
          required={true}
        >
          {getFieldDecorator(`${this.props.fieldNameQuestion}[${question.key}]["title"]`, {
            initialValue: question.title,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: "Please ask a question to the workers.",
            }],
          })(
            <Input placeholder={this.props.placeholderQuestion} style={{ width: '90%', marginRight: 8 }} />
          )}
        </Form.Item>

        {/* Configuration for radios. */}
        { question.type === "Radio" ?
          this._showDynamicItems(
            "Radio Option",
            "Please input an option of the question.",
            "Add radio option.",
            question.options,
            [this.props.fieldNameQuestion, question.key, "options"],
            this.props.placeholderOption
          ) : null}

        {/* Examples. */}
        {question.examples === undefined ? null : this._showDynamicItems(
          "Example",
          "Please provide an example of an answer to your question above.",
          "Add example.",
          question.examples,
          [this.props.fieldNameQuestion, question.key, "examples"],
          this.props.placeholderExample, 3
        )}
        {question.counterexamples === undefined ? null : this._showDynamicItems(
          "Counterexample",
          "Please provide an incorrect answer to your question above.",
          "Add counterexample.",
          question.counterexamples,
          [this.props.fieldNameQuestion, question.key, "counterexamples"],
          this.props.placeholderCounterexample, 3
        )}
      </>
    );
  }

  _showDynamicItems(title, textHelp, textAdd, fields, keys, placeholder = "", recommendedNumber = -1) {
    /* Show dynamic fields, and the adding button as well. */
    return (
      <>
        {/* The dynamic fields. */}
        <Form.Item
          {...(this.props.formItemLayout)}
          label={(
            <span>
              {title} &nbsp;
              <Tooltip
                title={textHelp}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>)}
          required={true}
        >
          {this._showDynamicInputs(fields, keys, placeholder)}
        </Form.Item>

        {/* The add button. */}
        <Form.Item
          {...this.formItemLayoutWithOutLabel}>
          <Button type="dashed"
            onClick={() => { this.props.addByKey(keys) }}
            style={{ width: '90%' }}>
            <PlusOutlined /> {textAdd}
          </Button>
          {/* Warning message when the number of fields is too many. */}
          {
            (recommendedNumber > 0 && fields.length > recommendedNumber) ?
              <div style={this.styleWarning}>
                <ExclamationCircleOutlined />
              Adding more than {recommendedNumber} examples is not recommended.
            </div> : null
          }
        </Form.Item>
      </>
    );
  }

  _showDynamicInputs(fields, keys, placeholder = "") {
    /** 
     * Render example(s) based on the type of `example[k]`. `example[k]` can
     * a string or an array of string.
     *
     * @param {Array}	    examples			Examples. Each element in it is {key: int, content: string}.
     * @param {Array}		keys				Path to the fields, so the parent can access the fields by
     * `self.state[keys[0]][keys[1]][...]`.
     * @param {String}	placeholder			Placeholder for the fields.
     * @param {Int}	    recommendedNumber	If > 0, show warning when fields.length > recommendedNumber.
     **/
    const { getFieldDecorator } = this.props.form;
    const { removeExample } = this.props;

    // Workround (?)
    if (fields === undefined) {
      fields = [{ key: 0, content: "" }]
    }

    // Generate the field name in the HTML form.
    let fieldName = keys[0].toString();
    for (let key of keys.slice(1)) {
      fieldName = fieldName + `[${key}]`;
    }

    // Elements to show
    const children = []
    for (const field of fields) {
      children.push(
        getFieldDecorator(
          `${fieldName}[${field.key}]`, {
          initialValue: field.content,
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
      if (fields.length > 1) {
        children.push(
          <Tooltip>
            <a onClick={
              (
                (id) => () => (
                  this.props.removeByKey(keys.concat([id]))
                )
              )(field.key)
            }>
              <MinusCircleOutlined />
            </a>
          </Tooltip>
        );
      }
    }
    return children;
  }
}


export default QuestionList;
export { lists2Questions, addKeys };
