import React from "react";
import {Button, Collapse, Drawer, Form, Input, Modal, Radio, Rate, Table, Tooltip} from 'antd';
import {clientUrl, serverUrl} from "../../configs";
import {ConsentForm, AnonymityNotice} from "./AgreeModal";
import queryString from 'query-string';
import Iframe from 'react-iframe';
import {connect} from "react-redux";
import QuestionList, {Markdown} from "./QuestionList.js";
import {lists2Questions, addKeys} from "../requesters/template/QuestionList.js";
import {lists2Systems} from "../requesters/template/System.js";
import {showFeedbackQuestion} from "./QuestionList.js";
import {getStyle} from "./style.js";


const Panel = Collapse.Panel;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function preprocess(emb)
{
  let Output = {};
  Output["intro"] = emb["generic_introduction"];
  Output["instructions"] = emb["generic_instructions"];
  Output["speech"] = emb["speech"];
  Output["MNor1N"] = emb["MNor1N"];

  while (emb["exampleTable"][0] && !(emb["exampleTable"][0].question)){
    emb["exampleTable"].shift();
  }

  Output["exampleTable"] = emb["exampleTable"];
  let body = [];
  emb["name_of_dialog"].forEach(function (x, i) {
    let temp = {};
    temp["name_of_dialog"] = x;
    temp["specific_instructions"] = emb["specific_instructions"][i];
    temp["subpoll"] = emb["subpoll"][i];
    temp["subtypeofpoll"] = emb["subtypeofpoll"][i];
    temp["url_dialog_system"]= emb["url_dialog_system"][i]
    body.push(temp);
  }
  );
  let end = [];
  emb["pollquestion"].forEach(function (x, i) {
    let temp = {};
    if (x) {
      temp["exitpoll"] = x;
      temp["polltype"] = emb["typeofpoll"][i];
      end.push(temp);
    }
  });
  let feedback = []
  let feedbackType = []
  if (emb["keys3"]){
    emb["keys3"].forEach(function(x, i){
      feedback.push(emb["feedback"][x]);
      feedbackType.push(emb["feedbackType"][x]);
    })
  }
  Output["feedback"] = feedback;
  Output["feedbackType"] = feedbackType;
  shuffle(body);
  shuffle(end);
  Output["body"] = body;
  Output["end"] = end;
  Output["time"] = emb["time"];
  Output["payment"] = emb["payment"];
  Output["consent"] = emb["consent"];

  /* let radio = emb["radio"]
   * if (typeof emb["radio"][0] === "string"){
   *   radio = [radio]
   * }

   * let feedbackradio = emb["feedbackradio"];
   * let newfeedbackradio = [];
   * let index = 0;
   * 
   * for (var i = 0; i < feedbackType.length; i++){
   *   if (feedbackType[i] === "Radio"){
   *     let loop = true;
   *     while (loop){
   *       if (feedbackradio[index] !== null){
   *         newfeedbackradio.push(feedbackradio[index])
   *         loop = false;
   *       }
   *       index++;
   *     }
   *   }
   *   else{
   *     newfeedbackradio.push("");
   *   }
   * }
   * Output["radios"] = radio
   * Output["feedbackradio"] = newfeedbackradio */

  return Output;
}

function getquestion(t, id) {
  fetch(serverUrl+'/api/worker/interactive/'+id)
    .then(function (response) { return response.json(); })
    .then(function (response) {
      if (response.err !== undefined) {
        Modal.error({content: response.err});
        return;
      }
      
      let json = preprocess(response);

      let questionSurveys;
      let questionFeedbacks;
      let questionSystems;
      // Workaround: response.questionSurveys should not be undefined.
      if (response.questionSurveys === undefined) {
        questionSurveys = lists2Questions(
          response.pollquestion,
          response.typeofpoll,
          response.radio,
          response.example,
          response.counterexample
        );
      } else {       
        questionSurveys = addKeys(response.questionSurveys);
      }
      // Workaround: response.questionFeedbacks should not be undefined.
      if (response.questionFeedbacks === undefined) {
        questionFeedbacks = lists2Questions(
          response.feedback || [],
          response.feedbackType || [],
          response.feedbackradio || []
        );
      } else {
        questionFeedbacks = addKeys(response.questionFeedbacks);
      }

      if (response.questionSystems === undefined) {
        // Workaround
        questionSystems = lists2Systems(
          response.name_of_dialog,
          response.generic_instructions,
          response.subpoll,
          response.subtypeofpoll,
          response.dialog_examples,
          response.dialog_counterexamples,
        );
      } else {
        questionSystems = addKeys(response.questionSystems);
      }            
      t.setState({
        speech: json.speech,
        interface: json.interface,
        intro: json.intro,
        instructions: json.instructions,
        feedback: json.feedback,
        feedbackType: json.feedbackType,
        timepay: json.time,
        payment: json.payment,
        consent: json.consent[1],
        feedbackradio: json.feedbackradio,
        questionSurveys: questionSurveys,
        questionFeedbacks: questionFeedbacks,
        questionSystems: questionSystems,
        requirements: addKeys(response.requirements || []),
        hasFeedbackQuestion: response.hasFeedbackQuestion,
        style: response.style,
        enableMarkdown: response.enableMarkdown
      });
    });
}

function SubmitFromUser(t, v, time) {
  fetch(serverUrl+'/api/save/worker/interactive/'+t.state.userID, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "times": time, "data": v, "submissiontime": Date.now(), "subId": t.state.subId })
  })
    .then(function (response) { return response.json(); })
    .then(function (json) {
      console.log(json);
      if (json.success) {
        confirm({
          title: 'Thank you for submission',
          content: 'Your survey code: ' + t.state.userID,
          onOk() {
          },
          onCancel() {
          },
        });
      }
      else
      {
        confirm({
          title: "Error",
          content: "You haven't talked to agents",
          onOk() {
          },
          onCancel() {
          },
        });
      }

    });

}

class WorkerInteractive extends React.Component {
  talk_to_system = (system) => {
    let id = system.agent;
    let url = "";

    // lookup URL from the system list by matching the id.
    this.props.system.forEach(x => {
      if (id === x["_id"]) {
        url = x["url"];
      }
    });
    
    this.setState({
      chaturl: (
        `${clientUrl}/chat?`
        + `option=${this.state.interface}&ip=${url}&userID=${this.state.userID}`
        + `&subId=${this.state.subId}&name_of_dialog=${system.name}`
        + `&help=${system.instruction}`
      ),
      current_system: system.name,
      visible: true,
      time: Date.now(),
      isSubmit: true
    });
  };

  componentDidMount() {
    var time = Date.now();
    this.setState({ userID: time });
    console.log(time);
    const params = queryString.parse(window.location.search);
    console.log(params);
    if (params.ID) {
      var Id = params.ID;
      this.setState({ subId: Id });
    }
    else
    {
      Id = "5aa2ea0f2972991520138bdb";
      this.setState({ subId: Id });
    }
    console.log(Id);
    getquestion(this, Id);
  }
  onClose = () => {
    let systems = this.state.system_time;
    systems.push({"system": this.state.current_system, "time": Date.now() - this.state.time})
    this.setState({
      visible: false,
      system_time: systems
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!this.state.isSubmit){
          confirm({
            content: 'Please talk to the system before submission',
            onOk() {
            },
            onCancel() {
            },
          });
        }
        else{
          SubmitFromUser(this, values, this.state.system_time);
          console.log('Received values of form: ', values);
        }
      }
    });
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

  changeTab = activeKey => {
    this.setState({
      activeKey: activeKey
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      instructions: "",
      speech: false,
      subId: "",
      isSubmit: false,
      question: "",
      answer: "",
      isdone: false,
      userID: "",
      visible: false,
      current: 1,
      path: "",
      meaning: "",
      examples: [],
      intro: "",
      systems: [],
      exitpoll: [],
      interface: "both",
      chaturl: "",
      feedback: [],
      feedbackType: [],
      time: "",
      system_time: [],
      current_system: "",
      timepay: "",
      payment: "",
      consent: "",
      radios: [],
      feedbackradio: [],
      activeKey: ["1", "2"],
      questionSurveys: [],
      questionFeedbacks: [],
      questionSystems: [],
      requirements: []
    };
  }

  render() {
    const columns = [{
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

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 11 },
      colon: false
    };
    const formItemLayout2 = {
      labelCol: { span: 10 },
      wrapperCol: { span: 7 },
      colon: false
    };

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    console.log(this.state);

    const likerts = ['1 Strongly Disagree', '', '', '', '5 Strongly Agree']
    const styles = getStyle(this.state.style, {
      dialogInstruction: {
        color: "#282828",
        fontSize: 18
      }
    });

    return <div style={styles.global}>
      <Drawer
        placement="right"
        width={720}
        closable={false}
        onClose={this.onClose}
        visible={this.state.visible}
      >
        <Iframe style={{"margin-right": "10px"}} url={this.state.chaturl}
                width="100%"
                height="600"
                display="initial"
                position="relative"
                allowFullScreen/>
      </Drawer>
      <Form onSubmit={this.handleSubmit} style={{ "margin-bottom": 0.1 }} >
        <Collapse defaultActiveKey={['1', '2']} activeKey={this.state.activeKey} onChange={this.changeTab}>
          <Panel header="Background " key="1" style={styles.tabTitle}>
            <p style={styles.background}>
              <Markdown enableMarkdown={this.state.enableMarkdown}>
                {this.state.intro}
              </Markdown>
            </p>
            <ConsentForm consent={this.state.consent}
                         checkboxes={this.state.requirements} />
            {/* <AnonymityNotice /> */}
          </Panel>
          <Panel header="Instructions " key="2" style={styles.tabTitle}>
            <div style={styles.instruction}>
              {this.state.enableMarkdown ?
               <Markdown enableMarkdown={this.state.enableMarkdown}>
                 {this.state.instructions}
               </Markdown> : <b>{this.state.instructions}</b>
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

            {this.showSystemExamples(styles)}
            
            <div style={{...styles.example, "fontSize": styles.example.fontSize + 4}}>
              <p>Example Answers for General Questions:</p>
            </div>
            <Table rowKey="sentid" dataSource={this.state.questionSurveys}
                   columns={columns} pagination={false}
                   style={{...styles.example,
                           marginTop: `${styles.global.spacing}px`,
                           marginBottom: `${styles.global.spacing}px`}}
                   size="small"/>
          </Panel>
          <Panel header="Interactive Tests " key="3" style={styles.tabTitle}>
            {!this.state.activeKey.includes("2") ?
             <div style={{"textAlign": "center"}}>
               <Button type="default" onClick={this.openInstructions}>Example Responses</Button>
             </div> : null}
            {/*this.state.speech ?
                <div title={"Audio Testing"} style={{ "margin-bottom": 0 }}  >
                <FormItem {...formItemLayout2} label="Step1: Test your speakers. Please click " style={{ "margin-bottom": 0 }}  >
                {getFieldDecorator('username')(
                <Button shape="circle" icon="caret-right" size={"large"} />

                )}
                </FormItem>
                <FormItem {...formItemLayout2} label="What did you hear?" style={{ "margin-bottom": 0 }}   >
                {getFieldDecorator('audiotest', {
                rules: [{
                required: true,
                message: 'What did you hear?',
                }],
                })(
                <Input placeholder="What did you hear?" />
                )}
                </FormItem>
                <FormItem {...formItemLayout3} label="Step2: Test your microphone. Please say 'Microphone test who was George Washington? ' after clicking. " style={{ "margin-bottom": 0 }}   >
                {getFieldDecorator('username')(
                <Button shape="circle" icon="customer-service" size={"large"}  />
                )}
                </FormItem>
                </div>
                :
                null
              */}
            {this.state.questionSystems.map(
              (system) => (
                <div key={system.key} title={system.name}
                     style={{"border": "1px solid black", padding: 18 + styles.global.spacing,
                             marginTop: `${12.5 + styles.global.spacing}px`}}
                >
                  {/* Left column (for system). */}
                  <div style={{"display": "inline-block", "width": "50%",
                               "padding-left": "40px", "padding-right": "10px",
                               "vertical-align": "top",
                               color: styles.dialogInstruction.color}}>
                    <span > Instructions: </span>
                    <br />
                    <span className="ant-form-text" style={styles.dialogInstruction}>
                      <b>{system.instruction}</b>
                    </span>
                    <br />
                    <span>{`Click to talk ${system.name}:`}</span>
                    {getFieldDecorator('username')(
                      <Button shape="circle" icon="message" size={"large"}
                              style={{margin: "10px"}}
                              onClick={() => this.talk_to_system(system)} />
                    )}
                  </div>
                  {/* Right column */}
                  <div style={{...styles.question,
                               "display": "inline-block", "width": "50%",
                               "padding-right": "40px", "padding-left": "10px",
                               "vertical-align": "top"}}>
                    <QuestionList
                      getFieldDecorator={getFieldDecorator}
                      questions={system.questions}
                      title=""
                      borderStyle="none"
                      fieldPrefix={`Sub|||${system.name}|||`}
                    />                        
                  </div>
                </div>
              )
            )}

    { /* Survey questions. */ }
    <div style={styles.question}>
      <QuestionList
        getFieldDecorator={getFieldDecorator}
        questions={this.state.questionSurveys}
        title="Survey"
        systemNames={this.state.questionSystems.map((s) => (s.name))}
        fieldPrefix="Exit"
      />
    </div>

            {/* Feedback questions */}
            <div style={{"backgroundColor": "#C1E7F8"}}>
              <FormItem
                style={{"textAlign": "center"}} wrapperCol={{span: 12, offset: 6}}
              >
                {showFeedbackQuestion(this.state.hasFeedbackQuestion, getFieldDecorator)}
              </FormItem>
            </div>
            <div style={{"text-align": "center"}}>
              <Button type="primary" htmlType="submit">Submit</Button>
            </div>
          </Panel>
        </Collapse>
      </Form>    
    </div>
  }

  showSystemExamples = (styles) => {
    /* Show the example answer and counterexample answers 
     * for system specific questions. */
    
    // make data source for Antd Table
    let table = [];
    let lastSystem = undefined;
    for (const system of this.state.questionSystems) {
      for (const question of system.questions) {
        // Add a row only when the question has an example/counterexample.
        if (question.examples.length > 0 ||
            question.counterexamples.length > 0) {
          // Don't show system if the name is same as the previous row.
          const systemName = system.name === lastSystem ? "" : system.name;
          table.push({
            system: systemName,
            question: question.title,
            examples: question.examples,
            counterexamples: question.counterexamples
          })
        }
      }
    }

    // Don't show anything if no question has an example/counterexample.
    if (table.length === 0) {
      return null;
    }

    // columns for antd Table
    const columns = [
      {title: "System", dataIndex: "system"},
      {title: "Question", dataIndex: "question"},
      {title: "Answer Examples", dataIndex: "examples",
       render: _renderExamples},
      {title: "Answer Counterexamples", dataIndex: "counterexamples",
       render: _renderExamples}
    ];
    
    return <>
      <div style={{...styles.example, "fontSize": styles.example.fontSize + 4}}>
        <p>Example Answers for System Specific Questions:</p>
      </div>
      <Table dataSource={table} columns={columns}
             pagination={false} size="small"
             style={{...styles.example,
                     marginTop: `${styles.global.spacing}px`,
                     /* marginBottom: `${styles.global.spacing}px` */
             }}
      />
    </>;
  }
}


function _renderExamples(examples, record) {
  return <ul>
    {examples.map((example, index) => (
      <li key={index}>
        {example.content}          
        {example.explain !== undefined ?
         <Tooltip title={example.explain}>
        &nbsp; <sub><a>because...</a></sub>
         </Tooltip> : null}
      </li>
    ))}
  </ul>;
}


  function mapStateToProps(state, props) {
  return {
        system:state.system,
  }
}


const mapDispatchToProps = {

};


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(WorkerInteractive));
export {_renderExamples,};

