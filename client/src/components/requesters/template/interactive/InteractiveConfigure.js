import React from 'react'
import { Button, Form, message, Spin, Tooltip, Table } from 'antd';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import { loadData } from "../../../../actions/sessionActions";
import { new_project_data } from "../../../../actions/crowdAction";
import InteractiveTemplate from "./InteractiveTemplate";
import FileReaderInput from 'react-file-reader-input';
import Configure from "../Configure.js"
import { SurveyQuestionList, addKeys } from "../QuestionList.js"
import System, { lists2Systems } from "./System.js"


const FormItem = Form.Item;

let sys_index = 0;
let survey_index = 0;
let feedback_index = 0;


class InteractiveConfigure extends Configure {
  handleSubmit = (e) => {
    /* Called when the submit button is clicked. */
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values["interactive_task_data"] = this.state.interactive_task_data
        values["consent"] = this.state.consent;
        this.submit(values, this.props.session._id);
      }
      else {
        console.log(err);
      }
    });
  };
  handleFileInputChange(_, results, targetStateProperty) {
    const [e, file] = results[0]
    var data1 = []
    var lines = e.target.result.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] == "")
        continue;
      var dic = {};
      dic["sentence"] = lines[i];
      dic["sentid"] = i + 1;
      dic["entity"] = []
      data1.push(dic);
    }
    if (data1.length > 0) {
      message.success(data1.length + ' tasks are loaded!');
    }
    this.setState({ [targetStateProperty]: data1 });
    //console.log(this.state.cluster_data);

  }

  static instructionSurvey = (
    "In this section, you can add, remove and edit questions regarding the "
    + "above systems. Different from the questions in the previous section, questions "
    + "here are not specific to a certain system. For example, you can ask the worker "
    + "to compare the above systems they have interacted with."
  );

  static helpTextSurveyQuestion = (
    "Add a question that is to be answered after the worker talks to all of your "
    + "interactive agents. You can, for example, ask the worker to compare"
    + "the agents they have interacted with."
  );

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      interactive_task_data: [],
    }
    this.saveURL = '/api/save/task/interactive/';
    this.taskName = 'interactive';
  }

  componentDidMount() {
    this.makeProps();
  }

  makeProps() {
    if (this.props.session.questionSystems === undefined) {
      // Workaround
      let systems = lists2Systems(
        this.props.session.name_of_dialog || [],
        this.props.session.generic_instructions,
        this.props.session.subpoll,
        this.props.session.subtypeofpoll,
        this.props.session.dialog_examples,
        this.props.session.dialog_counterexamples,
      );
      this.setState({ "questionSystems": systems });
    } else {
      this.setState(
        { "questionSystems": addKeys(this.props.session.questionSystems) }
      );
    }
    this.setState({
      interactive_task_data: this.props.session.interactive_task_data
    });
    super.makeProps();
  };

  render() {
    const textStyleExtras = [
      {
        name: 'Specific Instructions',
        fieldName: 'dialogInstruction',
        explain: "Set the text style of specific instructions for each dialogue system."
      },
      {
        name: 'Questions',
        fieldName: 'question',
        explain: "Set the style of the text in each question."
      }
    ];
    return (
      <div>
        <h2 style={{ "padding-left": "1%" }}>Template for an Interactive Task</h2>
        <p style={{ "padding-left": "1%" }}>This template is used for the creation of tasks that require the workers to interact with an agent.
          You can have one or more agents for the workers to interact, and ask questions about those agents.</p>
        {this.loading ? <Spin /> :
          <Form onSubmit={(e) => { this.handleSubmit(e) }}>
            {this._showGeneralConfig()}
            {this._showDataConfig()}
            {this._showConsentConfig()}
            {this._showSystemConfig()}
            {this._showSurveyConfig()}
            {this._showFeedbackConfig()}
            {this._showAppearanceConfig(textStyleExtras)}
            {this._showButtons()}
          </Form>
        }
      </div>
    );
  }
  _showDataConfig() {
    const { formItemLayout } = this;
    return (<>
      <h3 style={{ "padding-left": "1%" }}>Task</h3>
      <p style={{ "padding-left": "1%" }}>The Tasks you want the workers to follow.</p>
      <div style={{
        border: "2px solid black",
        margin: "10px",
        padding: 24
      }}>
        {this._showDataUpload(false)}
      </div>

    </>);
  }
  _showDataUpload(golden = false) {
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    let columns_dialog = [
      {
        title: 'ID',
        dataIndex: 'sentid',
        key: 'sendid',
        width: 100,
      },
      {
        title: 'Text',
        dataIndex: 'sentence',
        key: 'sentence',
      },
    ];
    if (golden) {
      columns_dialog.push({
        title: 'Answer',
        dataIndex: 'answer',
        key: 'answer'
      });
    }

    const explain = golden ? (<>
      <div>
        Please format your data as below, separated with new lines:
      </div>
      <div>"taskID":1, "tasks":["Cons": "area=south"]</div>
      <div>...</div>
    </>) : 'Please split the tasks by new line.';
    const targetStateProperty = golden ? 'dataGolden' : 'interactive_task_data';

    return (<>
      <FormItem
        {...formItemLayout}
        label={(
          <span>
            Upload your data&nbsp;
            <Tooltip title={explain}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
      >
        <FileReaderInput
          as='text'
          onChange={(e, results) => this.handleFileInputChange(e, results, targetStateProperty)}
        >
          <Button
            style={{ width: '90%' }}
          >
            <UploadOutlined /> Click to Upload
          </Button>
        </FileReaderInput>
      </FormItem>

      {(this.state[targetStateProperty] || []).length > 0 ? <div height={500}>
        <Table rowKey="sentence" dataSource={this.state[targetStateProperty]} columns={columns_dialog} pagination={{ hideOnSinglePage: true }} size="small" />
      </div> : null
      }

    </>);
  }

  _showSurveyConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const { instructionSurvey, helpTextSurveyQuestion } = this.constructor;
    return (<>
      {/* Surveys */}
      <h3 style={{ "padding-left": "1%" }}>General Questions</h3>
      <p style={{ "padding-left": "1%" }}>{instructionSurvey}</p>
      <SurveyQuestionList
        form={this.props.form}
        formItemLayout={formItemLayout}
        removeByKey={this.removeByKey}
        addByKey={this.addByKey}
        updateByKey={this.updateByKey}
        questions={this.state.questionSurveys}
        rootKey={["questionSurveys"]}
        systemNames={this.state.questionSystems.map(q => q.name)}
        questionFieldLabel="Question"
        questionHelpText={helpTextSurveyQuestion}
        textAddQuestion="Add "
        textInstruction={instructionSurvey}
        placeholderQuestion="Can you identify the difference between the systems?"
        placeholderExample="Yes, system A reacts like a real human most."
        placeholderCounterexample="I want the system to be more sociable."
        placeholderOption="Yes, somewhat."
      />
    </>);
  }


  _showSystemConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const instructionSystem = (
      "In this section, you can add, remove and edit the interactive agents you want "
      + "the workers interact with. For each system, you can set up one or more "
      + "questions specific to the system. For example, you can ask the worker to "
      + "assess the quality of a system. To make your task as clear as possible, "
      + "remember to provide some example answers and counter example answers to the "
      + "questions. These examples and counterexamples are important to let workers understand "
      + "what responses are acceptable and what the limitations are."
    );
    return (<>
      {/* Systems. */}
      <h3 style={{ "padding-left": "1%" }}>Interactive Agents</h3>
      <p style={{ "padding-left": "1%" }}> {instructionSystem} </p>
      <System
        form={this.props.form}
        formItemLayout={formItemLayout}
        removeByKey={this.removeByKey}
        addByKey={this.addByKey}
        updateByKey={this.updateByKey}
        fieldNameSystem="questionSystems"
        systems={this.state.questionSystems}
        agents={this.props.agents}
        helpText={instructionSystem}
      />
    </>);
  }

  _showTemplate() {
    return <InteractiveTemplate thisstate={this.props.session} />;
  }

};


function mapStateToProps(state) {
  return {
    session: state.session_interactive,
    agents: state.system,
  };
}


const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data
};


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(InteractiveConfigure));
