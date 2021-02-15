import React from "react";
import { Button, Collapse, Form, Modal, Radio, Select, Table } from 'antd';
import { ConsentForm } from "./AgreeModal";
import { serverUrl } from "../../configs";
import queryString from 'query-string';
import { lists2Questions, addKeys } from "../requesters/template/QuestionList.js"
import QuestionList, { Markdown } from "./QuestionList.js"
import { _renderExamples } from "./WorkerInteractive.js"
import { showFeedbackQuestion } from "./QuestionList.js";
import { getStyle } from './style.js';


const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

function getQuestion(t, id) {
  console.log(serverUrl)
  fetch(serverUrl + '/api/worker/quality/' + id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.err !== undefined) {
        Modal.error({ content: json.err });
        return;
      }
      let context = [];
      let response = [];

      json.quality_data.forEach(function (data, index) {
        context.push(data.context);
        response.push(data.response);
      })

      let questionSurveys;
      let questionFeedbacks;
      let questionSystems;
      // Workaround: json.questionSurveys should not be undefined.
      if (json.questionSurveys === undefined) {
        questionSurveys = lists2Questions(
          json.pollquestion,
          json.typeofpoll,
          json.radio,
          json.example,
          json.counterexample
        );
      } else {
        questionSurveys = addKeys(json.questionSurveys);
      }
      // Workaround: json.questionFeedbacks should not be undefined.
      if (json.questionFeedbacks === undefined) {
        questionFeedbacks = lists2Questions(
          json.feedback || [],
          json.feedbackType || [],
          json.feedbackradio || []
        );
      } else {
        questionFeedbacks = addKeys(json.questionFeedbacks);
      }
      console.log(json.quality_data)

      t.setState({
        data: json.quality_data,
        context: context,
        response: response,
        flag: json.flag,
        numofhit: json.quality_data.length,
        generic_introduction: json.generic_introduction,
        generic_instructions: json.generic_instructions,
        time: json.time,
        payment: json.payment,
        consent: json.consent[1],
        questionSurveys: questionSurveys,
        questionFeedbacks: questionFeedbacks,
        questionSystems: questionSystems,
        requirements: addKeys(json.requirements || []),
        hasFeedbackQuestion: json.hasFeedbackQuestion,
        style: json.style,
        enableMarkdown: json.enableMarkdown
      });
    });
}

function SubmitFromUser(t, v) {
  fetch(serverUrl + '/api/save/worker/quality/' + t.state.userID, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": t.state.data,
      "userID": t.state.userID,
      "submissiontime": Date.now(),
      "Result": v,
      "mid": t.state.MID,
      "ID": t.state.ID,
      "times": v.times
    })
  })
    .then(function (response) {
      return response.json();
    });
}


class WorkerQuality extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prev: 0,
      isSubmit: false,
      isdone: false,
      userID: "",
      visible: false,
      current: 1,
      context: [],
      response: [],
      order: [],
      flag: false,
      isShow: false,
      MID: "",
      ID: "",
      sent: [],
      feedback: [],
      questions: [],
      times: [],
      responses: [],
      consent: "",
      radios: [],
      feedbackradio: [],
      activeKey: ['1', '2']
    };
  }

  componentDidMount() {
    const params = queryString.parse(window.location.search);
    let mid = "MID";
    let ID = "5ab1e12c9c1ad4743a3fb1d6";
    let time = Date.now();
    if (params.MID) {
      mid = params.MID;
    }
    if (params.ID) {
      ID = params.ID;
    }

    this.setState({ userID: time });
    this.setState({ MID: mid });
    this.setState({ ID: ID });
    this.setState({ prev: time });
    getQuestion(this, ID);
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let time = Date.now();

    let responses = {};
    let feedback = {};
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Object.keys(values).forEach(function (data) {
          if (data.includes("FeedbackOpen|||")) {
            feedback[data] = values[data]
          }
          else {
            responses[data] = values[data]
          }
        })

        this.state.times.push(time - this.state.prev);
        this.state.responses.push(responses);

        if (this.state.current < this.state.numofhit) {
          this.props.form.resetFields();
          this.setState({ current: this.state.current + 1 });
        }
        else {
          SubmitFromUser(this, { "responses": this.state.responses, "feedback": feedback, "times": this.state.times })
          confirm({
            title: 'Thank you for submission',
            content: 'Your survey code: ' + this.state.userID,
            onOk() {
            },
            onCancel() {
            },
          });
        }
      }
      else {
        confirm({
          content: 'Please answer all the questions',
          onOk() {
          },
          onCancel() {
          },
        });
      }
    })
  }

  changeTab = activeKey => {
    /* if (activeKey.includes("3")){
     *   this.setState({
     *     time: Date.now()
     *   })
     * } */
    this.setState({
      activeKey: activeKey
    })
  }

  openInstructions = () => {
    if (!(this.state.activeKey.includes("2"))) {
      let x = this.state.activeKey;
      x.push("2");
      this.setState({
        activeKey: x
      })
    }
  }

  render() {
    const { current } = this.state;

    const { getFieldDecorator } = this.props.form;
    const formItemLayout2 = {
      labelCol: { span: 10 },
      wrapperCol: { span: 7 },
      colon: false
    };
    const formItemLayout = {
      wrapperCol: { span: 10 },
      colon: false
    }

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const likerts = ['1 Strongly Disagree', '', '', '', '5 Strongly Agree']
    /* Give default values to styles in case they are not set. */
    let styles = getStyle(this.state.style);

    return <div style={styles.global}>
      <Form onSubmit={this.handleSubmit} style={{ "marginBottom": 0.6 }}>
        <Collapse defaultActiveKey={['1', '2']}
          activeKey={this.state.activeKey} onChange={this.changeTab}>
          <Collapse.Panel header="Background" key="1" style={styles.tabTitle} >
            <p style={styles.background}>
              <Markdown enableMarkdown={this.state.enableMarkdown}>
                {this.state.generic_introduction}
              </Markdown>
            </p>
            <ConsentForm consent={this.state.consent} checkboxes={this.state.requirements} />
            {/* <AnonymityNotice />               */}
          </Collapse.Panel>
          <Collapse.Panel header="Instructions" key="2"
            style={styles.tabTitle}>
            <div style={styles.instruction}>
              {this.state.enableMarkdown ?
                <Markdown enableMarkdown={this.state.enableMarkdown}>
                  {this.state.generic_instructions}
                </Markdown> : <b>{this.state.generic_instructions}</b>
              }
            </div>
            <span style={{
              ...styles.instruction,
              "margin-top": `${-8 + styles.global.spacing}px`,
              "margin-bottom": `${styles.global.spacing}px`,
              fontSize: styles.instruction.fontSize - 2
            }}>
              We expect this HIT will take <b>{this.state.time} minute(s)</b> and we will pay <b>${this.state.payment}</b>.
                                                                                                          </span>
            {
              showExamples(
                this.state.questionSurveys,
                styles,
                { ...styles.example, "fontSize": styles.example.fontSize + 4 }
              )
            }

          </Collapse.Panel>

          <Collapse.Panel header="Quality Questions" key="3" style={styles.tabTitle}>
            {!this.state.activeKey.includes("2") ?
              <div style={{ "textAlign": "center" }}>
                <Button type="default" onClick={this.openInstructions}>Example Responses</Button>
              </div> : null}
            <div title="quality questions">
              <p style={{ "textAlign": "center", "margin-top": `${styles.global.spacing}px` }}>
                <div style={{ "textAlign": "center", "fontSize": 18 }}>
                  <b>"Answer the questions on the right about the context and response on the left."</b>
                </div>
              </p>
              <div style={{ "display": "inline-block", "width": "50%", "padding-left": "40px", "padding-right": "10px", "vertical-align": "top", "margin-top": `${-15 + styles.global.spacing}px` }}>
                <div>
                  <p style={{
                    "fontSize": styles.context.fontSize + 6,
                    "textAlign": styles.context.textAlign,
                    "fontWeight": "bold", "margin-bottom": "0px"
                  }}>
                    Context
            </p>
                </div>
                <div>
                  {this.state.flag ?
                    this.state.context[this.state.current - 1] ?
                      this.state.context[this.state.current - 1].map((item, i) => (
                        <p style={styles.context}>
                          {item.turn}. {item.utterance}
                        </p>
                      ))
                      : null : null
                  }
                </div>
                <div>
                  <span style={{
                    "fontSize": styles.response.fontSize + 6,
                    "textAlign": styles.response.textAlign,
                    "fontWeight": "bold",
                    "margin-bottom": `${styles.global.spacing}px`
                  }}>
                    Response
            </span>
                </div>
                <div>
                  {this.state.flag ?
                    this.state.response[this.state.current - 1] ?
                      <div>
                        <p style={styles.response}>{this.state.response[this.state.current - 1]}</p>
                      </div>
                      : null : null
                  }
                </div>
              </div>

              <div style={{ "display": "inline-block", "width": "50%", "padding-right": "40px", "padding-left": "10px", "vertical-align": "top", "margin-top": `${-15 + styles.global.spacing}px`, ...styles.question }}>
                { /* Survey questions. */}
                <QuestionList
                  getFieldDecorator={getFieldDecorator}
                  questions={this.state.questionSurveys}
                  title="Questions"
                />
              </div>

            </div>

            <div style={{ "backgroundColor": "#C1E7F8" }}>
              <FormItem style={{ "textAlign": "center" }}
                wrapperCol={{ span: 12, offset: 6 }}>
                {current < this.state.numofhit ?
                  <Button type="primary" htmlType="submit">
                    Next {current}/{this.state.numofhit}
                  </Button>
                  : showFeedbackQuestion(this.state.hasFeedbackQuestion, getFieldDecorator)
                }
              </FormItem>
            </div>
            {current >= this.state.numofhit ?
              <div style={{ "text-align": "center", "margin-top": `${-20 + styles.global.spacing}px`, "margin-bottom": "-10px" }}>
                <Button type="primary" htmlType="submit">Submit</Button>
              </div> : null}
          </Collapse.Panel>
        </Collapse>
      </Form>

    </div>

  }
}

function showExamples(questions, styles, titleStyle) {
  const columns_example = [{
    title: 'Question',
    dataIndex: 'title',
  }, {
    title: 'An Example Response',
    dataIndex: 'examples',
    key: 'examples',
    render: _renderExamples
  }, {
    title: 'A Counterexample Response',
    dataIndex: 'counterexamples',
    key: 'counterexamples',
    render: _renderExamples
  }];

  const dsExamples = (questions || []).filter(
    q => (q.examples || []).length > 0 || (q.counterexamples || []).length > 0
  );
  if (dsExamples.length === 0) {
    return null;
  } else {
    return (<>
      <div style={titleStyle}>
        <b>Examples</b>
      </div>
      <Table rowKey="sentid"
        dataSource={dsExamples}
        columns={columns_example}
        size="small"
        pagination={{ hideOnSinglePage: true }}
        style={styles.example} />
    </>);
  }
}

export default Form.create()(WorkerQuality)
export { showExamples };
