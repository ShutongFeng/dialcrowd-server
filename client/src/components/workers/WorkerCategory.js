import React from "react";
import {Button, Collapse, Form, Modal, Radio, Select, Table, Input, Rate} from 'antd';
import queryString from 'query-string';
import {ConsentForm, AnonymityNotice} from "./AgreeModal";
import {serverUrl} from "../../configs";
import {lists2Questions, addKeys} from "../requesters/template/QuestionList.js"
import QuestionList, {Markdown} from "./QuestionList.js"
import {_renderExamples} from "./WorkerInteractive.js"
import {showFeedbackQuestion} from "./QuestionList.js";
import {getStyle} from "./style.js";


const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;


function getQuestion(t, id) {

  fetch(serverUrl + '/api/worker/category/' + id)
      .then(function (response) {
        return response.json();
      })
    .then(function (json) {
      if (json.err !== undefined) {
        Modal.error({content: json.err});
        return;
      }

        let num = json.category_data.length / json.numofsent;
        let div = json.category_data.length % json.numofsent;
        if (div > 0)
        {
          num = parseInt(num)+1;
        }

        let questionFeedbacks;
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

        let questionCategories;
        if (json.questionCategories === undefined) {
          const labels = json.classLabel || [];
          questionCategories = lists2Questions(
            labels,
            labels.map((_) => ('')),
            labels.map((_) => ([])),
            json.classExample,
            json.classCounterexample
          );
        } else {
          questionCategories = addKeys(json.questionCategories);
        }

        t.setState({
          data: json.category_data,
          flag: json.flag,
          numofhit: num,
          numofsent: json.numofsent,
          exampleTable: json.exampleTable,
          generic_introduction: json.generic_introduction,
          generic_instructions: json.generic_instructions,
          time: json.time,
          payment: json.payment,
          consent: json.consent[1],
          requirements: addKeys(json.requirements || []),
          questionFeedbacks: questionFeedbacks,
          questionCategories: questionCategories,
          hasFeedbackQuestion: json.hasFeedbackQuestion,
          style: json.style,
          enableMarkdown: json.enableMarkdown
        });
    });
}

function SubmitFromUser(t, v) {
  fetch(serverUrl + '/api/save/worker/category/' + t.state.userID, {
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
      "feedback": t.feedback
    })
  })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {

        if (t.state.current > t.state.numofhit) {
          confirm({
            title: 'Thank you for submission. ',
            content: 'Your survey code: ' + t.state.userID + '. Please copy this code in AMT and refresh the page to restart.',
            onOk() {
            },
            onCancel() {
            },
          });
        }

      });
}

function sendAnswerDetail(v) {
  fetch(serverUrl + '/api/save/worker/detail/category/' + v["userId"], {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({"data": v})
  })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
      });
}


class WorkerCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prev: 0,
      isSubmit: false,
      isdone: false,
      userID: "",
      visible: false,
      current: 1,
      data: {},
      order: [],
      flag: false,
      isShow: false,
      MID: "",
      ID: "",
      sent: [],
      consent: "",
      activeKey: ["1", "2"],
      questionCategories: [],
      questionFeedbacks: [],
    };
    this.annotations = [];
  }

  componentDidMount() {
    const params = queryString.parse(window.location.search);
    let mid = "MID";
    let time = Date.now();
    let ID = "5aa2cc392972997dd9099c48";
    if (params.MID) {
      mid = params.MID;
    }
    if (params.ID) {
      ID = params.ID;
    }
    this.setState({userID: time});
    this.setState({prev: time});
    this.setState({MID: mid});
    this.setState({ID: ID});
    getQuestion(this, ID);
  }

  retrieveQuestion = (values) => {
    for (const [key, value] of Object.entries(values)) {
      if (key === "FeedbackOpen|||1") {
        this.feedback = value;
      } else {
        // index of data this annotation is for.
        let index = (this.state.current - 1) * this.state.numofsent + parseInt(key);
        let sentid = this.state.data[index].sentid;
        this.annotations.push({
          sentid: sentid,
          ...value
        });
      }
    }
    if (this.state.current == this.state.numofhit) {
      SubmitFromUser(this, this.annotations);
    }
    //getQuestion(this, this.state.ID);
    this.props.form.resetFields();
  }

  stateSet = (label, sent, i) => {
    let dic = {};
    let time = Date.now();

    dic["timestamp"] = time;
    dic["label"] = label;
    dic["sentence"] = sent;
    dic["userId"] = this.state.userID;
    dic["taskId"] = this.state.ID;
    dic["sentId"] = i
    
    if (this.state.sent.some(e => e.sentId == i)){
      for (var a = 0; a < this.state.sent.length; a++){
        if (this.state.sent[a]["sentId"] == i){
          this.state.sent[a]["duration"] = this.state.sent[a]["duration"] + time - this.state.prev;
        }
      }
    }
    else{
      dic["duration"] = dic["timestamp"] - this.state.prev;
      if (!sent){
        this.setState({sent: [dic]});
      }
      else{
        this.state.sent.push(dic);
      }
      
    }

    this.setState({prev: time});
  }

  handleSubmit = (e) => {
    e.preventDefault();

    for (var b = 0; b < this.state.sent.length; b++){
      sendAnswerDetail(this.state.sent[b]);
    }
    this.setState({prev: Date.now()});

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.retrieveQuestion(values);
        console.log('Received values of form: ', values);
        if (this.state.current < this.state.numofhit) {
          this.setState({current: this.state.current + 1});
        }
        else {
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
        console.log("err");
        if (this.state.current > this.state.numofhit) {
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
    });
  }

  changeTab = activeKey => {
    if (activeKey.includes("3")){
      this.setState({
        prev: Date.now(),
        activeKey: activeKey
      })
    }
  }

  openInstructions = () => {
    if (!(this.state.activeKey.includes("2"))){
      let x = this.state.activeKey;
      x.push("2");
      this.setState({
        activeKey: x
      })
    }
  }

  render() {
    const columns_example = [{
      title: 'Category',
      dataIndex: 'title',
      key: 'title',
    }, {
      title: 'An Example',
      dataIndex: 'examples',
      key: 'examples',
      render: _renderExamples
    }, {
      title: 'A Counterexample',
      dataIndex: 'counterexamples',
      key: 'counterexamples',
      render: _renderExamples      
    }];

    const {getFieldDecorator} = this.props.form;
    const {current} = this.state;
    const formItemLayout2 = {
      labelCol: {span: 14},
      wrapperCol: {span: 10},
      colon: false
    };
    const formItemLayout = {
      wrapperCol: {span: 10},
      colon: false
  }
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const likerts = ['1 Strongly Disagree', '', '', '', '5 Strongly Agree'];
    const labels = this.state.questionCategories.map((c) => (c.title));
    let styles = getStyle(this.state.style);

    return <div style={styles.global}>
      <div id="surveyContainer"></div>
      <Form onSubmit={this.handleSubmit} style={{"marginBottom": 0.6}}>
        <Collapse defaultActiveKey={['1', '2']} onChange={this.changeTab} activeKey={this.state.activeKey}>
          <Panel header="Background" key="1"  style={styles.tabTitle}>
            <p style={styles.background}>
              <Markdown enableMarkdown={this.state.enableMarkdown}>
                {this.state.generic_introduction}
              </Markdown>
            </p>
            <ConsentForm consent={this.state.consent} checkboxes={this.state.requirements}/>
            {/* <AnonymityNotice /> */}
          </Panel>
          <Panel header="Instructions" key="2" style={styles.tabTitle}>
            <div style={styles.instruction}>
              {this.state.enableMarkdown ?
               <Markdown enableMarkdown={this.state.enableMarkdown}>
                 {this.state.generic_instructions}
               </Markdown> : <b>{this.state.generic_instructions}</b>
              }
            </div>
            <p style={{
              ...styles.instruction,
              marginTop: '0px',
              marginBottom: '0px',
              fontSize: styles.instruction.fontSize - 2
            }}>
              We expect this HIT will take <b>{this.state.timepay} minute(s)</b> and we will pay <b>${this.state.payment}</b>.
            </p>
            <div style={{...styles.example, "fontSize": styles.example.fontSize + 4}}>
              <p><b>Examples</b></p>
            </div>
            <Table rowKey="sentid"
                   dataSource={this.state.questionEntities}
                   columns={columns_example} size="small"
                   style={{...styles.example,
                           marginTop: `${styles.global.spacing}px`,
                           marginBottom: `${styles.global.spacing}px`}} />
          </Panel>
          <Panel header="Category classification" key="3" style={styles.tabTitle}>
            {!this.state.activeKey.includes("2") ?
             <div style={{"textAlign": "center"}}>
               <Button type="default" onClick={this.openInstructions}>Example Responses</Button>
             </div> : null}            
            <div title="category classification">
              <div style={{"textAlign": "center"}}>
                <p style={{"textAlign": "center", "fontSize": 18,
                           marginTop: styles.global.spacing,
                           marginBottom: 0}}><b>"Select a category for the given text"</b></p>
              </div>
              <div style={{"textAlign": "center", marginBottom: `${styles.global.spacing + 22.5}px`}}>
                <Button type="default" onClick={this.openInstructions}>Example Responses</Button>
              </div>
              {this.state.flag ?
               this.state.data.slice((this.state.current-1)*this.state.numofsent, (this.state.current)*this.state.numofsent).map((item, i) => (
                 <div style={{"backgroundColor": "#f7f7f7", marginBottom: `${styles.global.spacing}px`}}>
                   <FormItem className={'two-rows-label'}
                             {...formItemLayout2}
                             label={<div style={{
                               display: "inline-block",
                               "float": "left",
                               "whiteSpace": "normal",
                               "marginRight": "12px",
                               "text-align": "left",
                               "lineHeight": "15px"
                             }}>{item.sentence.split("|||").map(
                                 x => <p style={styles.utterance}>{x}</p>)
                             }</div>}
                             hasFeedback
                   >
                     {getFieldDecorator(`[${i}]["answer"]`, {
                       rules: [
                         {required: true, message: 'Please select a category'},
                       ],
                     })(
                       <Select onSelect={(e) => this.stateSet(e, item.sentence, i)}
                               placeholder="Please select a category">
                         {labels.map((label, j) => (
                           <Option value={label}>{label}</Option>
                         ))}
                       </Select>
                     )}
                   </FormItem>
                   <FormItem
                     {...formItemLayout2}
                     label={<div style={{
                       color: "forestgreen",
                       "display": "inline-flex"
                     }}>{"Confidence of your answer? (1: Not confident, 3: Very confident) "}</div>}
                   >
                     {getFieldDecorator(`[${i}]["confidence"]`, {
                       rules: [
                         {required: true, message: 'Please select a confidence level'},
                       ],
                     }
                 )(
                   <RadioGroup>
                     <Radio value="1">1</Radio>
                     <Radio value="2">2</Radio>
                     <Radio value="3">3</Radio>
                   </RadioGroup>
                 )}
                   </FormItem>
                 </div>
                 ))
              :
               null
              }

            </div>
          </Panel>
        </Collapse>

        <div style={{"backgroundColor": "#C1E7F8"}}>
          <FormItem style={{"textAlign": "center"}}
                    wrapperCol={{span: 12, offset: 6}}
          >
            <p style={{"textAlign": "center", "fontSize": 15, "color": "black"}}>You will get the code after you complete the HIT.</p>
            {current < this.state.numofhit ?
                       <Button type="primary" htmlType="submit">Next {current}/{this.state.numofhit}</Button>
            :
                       <div title={"Feedback"} style={{margin: "10px", padding:24 }} >
                         {showFeedbackQuestion(this.state.hasFeedbackQuestion, getFieldDecorator)}
                         <Button type="primary" htmlType="submit">Submit</Button>
                       </div>
            }
          </FormItem>
        </div>
      </Form>
    </div>
  }
}

export default Form.create()(WorkerCategory)
