import React from "react";
import {
  Button,
  Collapse,
  Drawer,
  Form,
  Input,
  Modal,
  Radio,
  Rate,
  Table,
} from "antd";
import ReactMarkdown from "react-markdown";

class QuestionList extends React.Component {
  /* Props:
   * @{function}	getFieldDecorator
   * @{Array}		questions
   * @{String}		title
   * @{Array}		systemNames
   * @{String}		borderStyle: either 'box' or 'none'.
   * @{String}		This is used to identify feedback question.
   * Feedback questions are prefixed with "Exit". Default is `""`.
   */
  constructor(props) {
    super(props);
  }

  render() {
    const { questions, title, borderStyle } = this.props;
    switch (borderStyle || "box") {
      case "box": {
        return (
          <div
            title={title}
            style={{ border: "2px solid black", margin: "10px", padding: 5 }}
          >
            {questions.map((question, i) => this._renderQuestion(question, i))}
          </div>
        );
      }
      case "none": {
        return questions.map((question, i) =>
          this._renderQuestion(question, i)
        );
      }
    }
  }

  _renderQuestion(question, index) {
    const { getFieldDecorator, systemNames, title } = this.props;
    // This is used to identify feedback question.
    // Feedback questions are prefixed with "Exit".
    const fieldPrefix = this.props.fieldPrefix || "";
    const scale = question.likertScale || 5;
    const likerts = ["1 Strongly Disagree"].concat(
      Array(scale > 2 ? scale - 2 : 0).fill(""),
      [`${scale} Strongly Agree`]
    );
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 11 },
      colon: false,
    };

    const formItemLayout2 = {
      labelCol: { span: 10 },
      wrapperCol: { span: 7 },
      colon: false,
    };

    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px",
    };

    // no padding for system questions.
    const paddingStyle =
      this.props.borderStyle === "none" ? {} : { "padding-left": "5%" };

    switch (question.type) {
      case "Likert Scale": {
        return (
          <div style={paddingStyle}>
            <span>
              {index + 1}. {question.title.replace(".", "")}
              <br />
              {`(0 star for strongly disagree, ${
                question.likertScale || 5
              } for strongly agree.)`}
            </span>
            <Form.Item style={{ "margin-bottom": 0 }} {...formItemLayout2}>
              {title !== "Feedback" ? (
                <div>
                  {getFieldDecorator(
                    fieldPrefix +
                      "Likert|||" +
                      question.title.replace(".", "") +
                      "|||" +
                      index,
                    {
                      initialValue: 0,
                      rules: [
                        {
                          required: true,
                          message: "Please input your answer",
                        },
                      ],
                    }
                  )(
                    <Rate
                      count={question.likertScale || 5}
                      tooltips={likerts}
                      value={0}
                      defaultValue={0}
                    />
                  )}
                </div>
              ) : (
                <div>
                  {getFieldDecorator(
                    fieldPrefix +
                      "Likert|||" +
                      question.title.replace(".", "") +
                      "|||" +
                      index
                  )(<Rate tooltips={likerts} value={0} defaultValue={0} />)}
                </div>
              )}
            </Form.Item>
          </div>
        );
      }
      case "Open ended": {
        return (
          <div style={paddingStyle}>
            <span>
              {index + 1}. {question.title.replace(".", "")}
            </span>
            <Form.Item {...formItemLayout2} style={{ "margin-bottom": 0 }}>
              {title !== "Feedback" ? (
                <div>
                  {getFieldDecorator(
                    fieldPrefix +
                      "Open|||" +
                      question.title.replace(".", "") +
                      "|||" +
                      index,
                    {
                      rules: [
                        {
                          required: true,
                          message: "Please input your answer",
                        },
                      ],
                    }
                  )(<Input placeholder="Please input your answer" />)}{" "}
                </div>
              ) : (
                <div>
                  {getFieldDecorator(
                    fieldPrefix +
                      "Open|||" +
                      question.title.replace(".", "") +
                      "|||" +
                      index
                  )(<Input placeholder="Please input your answer" />)}{" "}
                </div>
              )}
            </Form.Item>
          </div>
        );
      }
      case "Radio": {
        return (
          <div style={paddingStyle}>
            <span>
              {index + 1}. {question.title.replace(".", "")}
            </span>
            <Form.Item {...formItemLayout} style={{ "margin-bottom": 0 }}>
              {title !== "Feedback" ? (
                <div>
                  {getFieldDecorator(
                    fieldPrefix +
                      "Radio|||" +
                      question.title.replace(".", "") +
                      "|||" +
                      index,
                    {
                      rules: [
                        {
                          required: true,
                          message: "Please input your answer",
                        },
                      ],
                    }
                  )(
                    <Radio.Group>
                      {question.options.map((option) => (
                        <Radio style={radioStyle} value={option.content}>
                          <span>{option.content}&nbsp;</span>
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}{" "}
                </div>
              ) : (
                <div>
                  {getFieldDecorator(
                    fieldPrefix +
                      "Radio|||" +
                      question.title.replace(".", "") +
                      "|||" +
                      index
                  )(
                    <Radio.Group>
                      {question.options.map((option) => (
                        <Radio style={radioStyle} value={option.content}>
                          <span>{option.content}&nbsp;</span>
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}{" "}
                </div>
              )}
            </Form.Item>
          </div>
        );
      }
      case "Voting": {
        return (
          <div style={{ "padding-left": "40%" }}>
            <span>
              {index + 1}. {question.title.replace(".", "")}
            </span>
            <Form.Item style={{ "margin-bottom": 0 }} {...formItemLayout2}>
              {getFieldDecorator(
                fieldPrefix +
                  "AB|||" +
                  question.title.replace(".", "") +
                  "|||" +
                  index,
                {
                  rules: [
                    {
                      required: true,
                      message: "Please input your answer",
                    },
                  ],
                }
              )(
                <Radio.Group>
                  {systemNames.map((name) => (
                    <Radio value={name.replace(".", "")}>
                      {name.replace(".", "")}
                    </Radio>
                  ))}
                  <Radio value={"Draw"}>{"Draw"}</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </div>
        );
      }
    }
  }
}

function showFeedbackQuestion(show, getFieldDecorator) {
  if (!show) {
    return null;
  }
  return (
    <div
      title={"Feedback"}
      style={{
        width: "500px",
        margin: "0 auto",
        "text-align": "center",
      }}
    >
      <p style={{ fontSize: 15, color: "black", "margin-bottom": "-10px" }}>
        <b>(Optional)</b> Please let us know if you have any further feedback:
      </p>
      {getFieldDecorator("FeedbackOpen|||1")(
        <Input
          placeholder=""
          style={{ width: "80%", height: "80px", marginRight: 8 }}
        />
      )}
    </div>
  );
}

class Markdown extends React.Component {
  /* Props:
     {@Bool} enableMarkdown
  */
  render() {
    if (this.props.enableMarkdown) {
      return <ReactMarkdown children={this.props.children} />;
    } else {
      return <> {this.props.children} </>;
    }
  }
}

export default QuestionList;
export { showFeedbackQuestion, Markdown };
