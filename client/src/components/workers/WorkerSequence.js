import React from "react";
import { Button, Collapse, Form, Modal, Table, Radio } from 'antd';
import { DeleteOutlined, SelectOutlined } from '@ant-design/icons'
import TextEditor from './TextEditor'
import { ConsentForm } from "./AgreeModal";
import { serverUrl } from "../../configs";
import queryString from 'query-string';
import { Markdown } from "./QuestionList.js"
import { lists2Questions, addKeys } from "../requesters/template/QuestionList.js"
import { _renderExamples } from "./WorkerInteractive.js"
import { showFeedbackQuestion } from "./QuestionList.js";
import { getStyle } from "./style.js";


const confirm = Modal.confirm;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

function getQuestion(t, id) {
  fetch(serverUrl + '/api/worker/sequence/' + id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.err !== undefined) {
        Modal.error({ content: json.err });
        return;
      }

      let questionEntities;
      if (json.questionEntities === undefined) {
        const labels = json.Label || [];
        questionEntities = lists2Questions(
          labels,
          labels.map((_) => ('')),
          labels.map((_) => ([])),
          json.Example,
          json.Counterexample
        );
      } else {
        questionEntities = addKeys(json.questionEntities);
      }

      t.setState({
        data: json.sequence_data,
        flag: json.flag,
        Label: json.Label,
        numofhit: json.sequence_data.length,
        exampleTable: json.exampleTable,
        generic_introduction: json.generic_introduction,
        generic_instructions: json.generic_instructions,
        timepay: json.time,
        payment: json.payment,
        consent: json.consent,
        requirements: addKeys(json.requirements || []),
        questionEntities: questionEntities,
        hasFeedbackQuestion: json.hasFeedbackQuestion,
        style: json.style,
        enableMarkdown: json.enableMarkdown
      });
    });
}

function SubmitFromUser(t, v) {
  fetch(serverUrl + '/api/save/worker/sequence/' + t.state.userID, {
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
      "ID": t.state.ID
    })
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      console.log(json);
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


class WorkerSequence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1, Label: [], MID: "",
      Orgs: [], Names: [], Locs: [],
      selectorStart: 0, selectorEnd: 0,
      oStart: 0, oEnd: 0,
      nStart: 0, nENd: 0,
      lStart: 0, lEnd: 0,
      selecttext: "", orgset: "", org: "", lastOrg: "", name: "", lastName: "", loc: "", losLoc: "",
      output: {
        sentence: "",
        entities: []
      },
      feedback: [],
      feedbackType: [],
      time: "",
      isFirst: true,
      timepay: "",
      payment: "",
      consent: "",
      feedbackradio: [],
      activeKey: ["1", "2"],
      questionEntities: [],
      questionFeedbacks: [],
    };
    this.annotations = [];
    this.SelectText = this.SelectText.bind(this);
    this.clickEntity = this.clickEntity.bind(this);
  }

  componentDidMount() {
    const params = queryString.parse(window.location.search);
    let mid = "MID";
    let ID = "5ab1e12c9c1ad4743a3fb1d6";
    if (params.MID) {
      mid = params.MID;
    }
    if (params.ID) {
      ID = params.ID;
    }
    var time = Date.now();
    this.setState({ userID: time });
    this.setState({ MID: mid });
    this.setState({ ID: ID });
    getQuestion(this, ID);
  }

  async retrieveQuestion(values) {
    await SubmitFromUser(this, values);
    // await getQuestion(this, this.state.ID);
    this.setState({ Orgs: [] });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let feedback = [];
    this.props.form.validateFields((err, values) => {
      if (!err) {
        feedback = values;
      }
    })

    var values = {
      "sentence": this.state.data[this.state.current - 1].sentence,
      "entity": this.state.Orgs,
      "sentid": this.state.data[this.state.current - 1].sentid,
      "time": Date.now() - this.state.time,
      "feedback": feedback
    };
    this.annotations.push(values);
    if (this.state.current < this.state.numofhit) {
      this.setState({ current: this.state.current + 1, Orgs: [] });
    } else {
      SubmitFromUser(this, this.annotations);
      confirm({
        title: 'Thank you for submission',
        content: 'Your survey code: ' + this.state.userID,
        onOk() {
        },
        onCancel() {
        },
      });
    }
    this.setState({ isFirst: false });
  }

  // changeTab = activeKey => {
  //   if (activeKey.includes("3")){
  //     this.setState({
  //       time: Date.now()
  //     })
  //   }
  // }

  openInstructions = () => {
    if (!(this.state.activeKey.includes("2"))) {
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

  SelectText() {
    try {
      var selecter = window.getSelection();
      if (selecter !== null && selecter !== "") {
        console.log(selecter);
        this.setState({ selecttext: selecter.toString() });
        console.log("demo: " + selecter);
      }

    } catch (err) {
      var selecter = document.getSelection();
      var s = selecter.text;
      if (s !== null) {
        console.log(s)
      }
    }
    if (window.getSelection) {
      var userSelection = window.getSelection();
    }
    this.setState({ selectorStart: selecter.anchorOffset })
    this.setState({ selectorEnd: selecter.focusOffset })
    if (this.state.isFirst || isNaN(parseInt(this.state.time))) {
      this.setState({ time: Date.now() })
    }
  }

  clickEntity(arg) {
    var instance = {
      "type": arg,
      "value": this.state.selecttext.toString().trim(),
      "start": this.state.selectorStart,
      "end": this.state.selectorEnd,
      "Id": Date.now(),
      "text": this.state.data[this.state.current - 1].sentence,
      entities: [{ "start": this.state.selectorStart, "end": this.state.selectorEnd, "entity": arg }]
    };
    var temp = this.state.Orgs;
    temp.push(instance);
    this.setState({ Orgs: temp });
    console.log(this.state.Orgs);

    if (document.all) {
      var tr = document.selection.createRange();
      tr.execCommand("ForeColor", false, "#FF0000");
    } else {
      var tr = window.getSelection().getRangeAt(0);
      var span = document.createElement("span");
      span.style.cssText = "color:orange";
    }

    //tr.surroundContents(span);
  }

  deleteEnt = (Id) => {
    var index = -1;
    for (var i = 0; i < this.state.Orgs.length; i++) {
      if (this.state.Orgs[i].Id === Id)
        index = i;
    }
    console.log(index);
    console.log(Id);
    var temp = this.state.Orgs;
    if (index > -1) {
      temp.splice(index, 1);
    }
    this.setState({ Orgs: temp });
  };

  render() {
    const { current } = this.state;

    const columns_example = [{
      title: 'Type',
      dataIndex: 'title',
      key: 'title',
    }, {
      title: 'Example',
      dataIndex: 'examples',
      key: 'examples',
      render: _renderExamples
    }, {
      title: 'Counterexample',
      dataIndex: 'counterexamples',
      key: 'counterexamples',
      render: _renderExamples
    }];


    const labels = this.state.questionEntities.map((q) => (q.title));
    const columns = [
      {
        title: 'Entity Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Entity Value',
        dataIndex: 'value',
        key: 'value',
      },
      {
        title: 'Example',
        dataIndex: 'example',
        key: 'example',
        render: (_, example) => (
          <TextEditor
            example={example}
            entityNames={labels}
          />
        ),
      },
      {
        title: 'Edit',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => (
          <span className="table-operation">
            {
              <span>
                <a onClick={() => this.deleteEnt(record.Id)}><DeleteOutlined /> delete</a>
              </span>
            }
          </span>
        ),
      },
    ];

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
    const styles = getStyle(this.state.style, {
      utterance: {
        fontSize: 20,
        textAlign: 'center'
      }
    });

    return <div style={styles.global}>
      <Form onSubmit={this.handleSubmit} style={{ "marginBottom": 0.6 }}>
        <Collapse defaultActiveKey={['1', '2']} activeKey={this.state.activeKey} onChange={this.changeTab}>
          <Collapse.Panel header="Background" key="1" style={styles.tabTitle}>
            <p style={styles.background}>
              <Markdown enableMarkdown={this.state.enableMarkdown}>
                {this.state.generic_introduction}
              </Markdown>
            </p>
            <ConsentForm consent={this.state.consent} checkboxes={this.state.requirements} />
            {/* <AnonymityNotice />               */}
          </Collapse.Panel>
          <Collapse.Panel header="Instructions" key="2" style={styles.tabTitle}>
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
            <div style={{ ...styles.example, "fontSize": styles.example.fontSize + 4 }}>
              <p><b>Examples</b></p>
            </div>
            <Table rowKey="sentid"
              dataSource={this.state.questionEntities}
              columns={columns_example} size="small"
              style={{ ...styles.example, marginBottom: `${styles.global.spacing}px` }} />
          </Collapse.Panel>
          <Collapse.Panel header="Sequence Labeling" key="3" style={styles.tabTitle}>

            <div
              title="Select the text that you recognize as an entity and choose the corresponding type of entity using the buttons below.">
              <div>
                <p style={{ "textAlign": "center", "fontSize": 18, marginTop: `${styles.global.spacing}px` }}>
                  <b>Select the text that you recognize as an entity and choose the corresponding type of entity using the
                    buttons below.</b></p>
              </div>
              <div style={{
                "textAlign": "center",
                marginTop: `${styles.global.spacing}px`,
                marginBottom: `${10 + styles.global.spacing}px`
              }}>
                <Button type="default" onClick={this.openInstructions}>Example Responses</Button>
              </div>
              {this.state.flag ?
                this.state.data.slice(this.state.current - 1, this.state.current).map((item, i) => (
                  <div>
                    <p style={styles.utterance} onClick={this.SelectText}>{item.sentence}</p>
                    {labels.map((label, j) => (
                      <Button type="primary" style={{ "marginLeft": "10px" }}
                        onClick={() => this.clickEntity(label)}><SelectOutlined />{label}</Button>
                    ))}
                  </div>
                ))
                :
                null
              }
            </div>

            <div title="Annotations" style={{ "marginTop": `${20 + styles.global.spacing}px` }}>
              <Table dataSource={this.state.Orgs} columns={columns} size="small" pagination={false}
                style={styles.answer} />
            </div>
            <div style={{ "backgroundColor": "#C1E7F8" }}>
              <FormItem style={{ "textAlign": "center" }}
                wrapperCol={{ span: 12, offset: 6 }}
              >
                <p style={{ "textAlign": "center", "fontSize": 15, "color": "black" }}>You will get the code after you finish
                  everything</p>
                {current < this.state.numofhit ?
                  <Button type="primary" htmlType="submit">Next {current}/{this.state.numofhit}</Button>
                  :
                  <>
                    {showFeedbackQuestion(this.state.hasFeedbackQuestion, getFieldDecorator)}
                    <div style={{ "margin-top": `${-20 + styles.global.spacing}px` }}>
                      <Button type="primary" htmlType="submit">Submit</Button>
                    </div>
                  </>
                }
              </FormItem>
            </div>
          </Collapse.Panel>
        </Collapse>
      </Form>

    </div>

  }
}



export default Form.create()(WorkerSequence);
