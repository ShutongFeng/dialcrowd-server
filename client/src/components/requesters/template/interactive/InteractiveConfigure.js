import React, {Component} from 'react'
import {Button, Form, Icon, Input, message, Radio, Spin, Switch, Tooltip, Modal} from 'antd';
import {connect} from "react-redux";
import queryString from 'query-string';
import {clientUrl, serverUrl} from "../../../../configs";
import {loadData} from "../../../../actions/sessionActions";
import {Message} from 'react-chat-ui';
import {new_project_data} from "../../../../actions/crowdAction";
import InteractiveTemplate from "./InteractiveTemplate";
import FileReaderInput from 'react-file-reader-input';
import Configure from "../Configure.js"
import {SurveyQuestionList, addKeys} from "../QuestionList.js"
import PreviewButton from "./PreviewButton.js";
import System, {lists2Systems} from "./System.js"
import {saveAs} from 'file-saver';


const FormItem = Form.Item;

let sys_index = 0;
let survey_index = 0;
let feedback_index = 0;


class InteractiveConfigure extends Configure {
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
      this.setState({"questionSystems": systems});
    } else {
      this.setState(
        {"questionSystems": addKeys(this.props.session.questionSystems)}
      );
    }
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
        <h2 style={{"padding-left": "1%"}}>Template for an Interactive Task</h2>
        <p style={{"padding-left": "1%"}}>This template is used for the creation of tasks that require the workers to interact with an agent.
          You can have one or more agents for the workers to interact, and ask questions about those agents.</p>
        {this.loading ? <Spin /> : 
         <Form onSubmit={(e) => {this.handleSubmit(e)}}>
           {this._showGeneralConfig()}
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

  _showSurveyConfig () {
    const {getFieldDecorator} = this.props.form;
    const {formItemLayout, formItemLayoutWithOutLabel} = this;
    const {instructionSurvey, helpTextSurveyQuestion} = this.constructor;
    return (<>
      {/* Surveys */}
      <h3 style={{"padding-left": "1%"}}>General Questions</h3>
      <p style={{"padding-left": "1%"}}>{instructionSurvey}</p>
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

  
  _showSystemConfig () {
    const {getFieldDecorator} = this.props.form;
    const {formItemLayout, formItemLayoutWithOutLabel} = this;
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
      <h3 style={{"padding-left": "1%"}}>Interactive Agents</h3>
      <p style={{"padding-left": "1%"}}> {instructionSystem} </p>
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

  _showTemplate () {
    return <InteractiveTemplate thisstate={this.props.session}/>;
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
