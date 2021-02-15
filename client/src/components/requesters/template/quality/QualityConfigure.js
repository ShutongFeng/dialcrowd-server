import React from 'react';
import { Button, Form, message, Table, Tooltip } from 'antd';
import { EyeOutlined, UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { connect } from "react-redux";
import 'react-datasheet/lib/react-datasheet.css';
import FileReaderInput from 'react-file-reader-input';
import { clientUrl } from "../../../../configs";
import { loadData } from "../../../../actions/sessionActions";
import { new_project_data } from "../../../../actions/crowdAction";
import QualityTemplate from "./QualityTemplate";
import Configure from "../Configure.js"

const FormItem = Form.Item;

let survey_index = 0;
let feedback_index = 0;


class QualityConfigure extends Configure {
  static instructionSurvey = (
    "In this section, you can add, remove and edit questions regarding the "
    + "the conversations presented. The worker will need to answer these questions "
    + "for each conversation you uploaded. For example, you can ask the worker "
    + "to assess the fluency of the conversation."
  );

  static helpTextSurveyQuestion = (
    "Add a question that is to be answered for each conversation you uploaded. "
    + "You can, for example, ask the worker to assess the fluency of the conversation."
  );

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      quality_data: []
    };
    this.saveURL = "/api/save/task/quality/";
    this.taskName = "quality";
  }

  makeProps() {
    super.makeProps();
    for (const prop of ["quality_data", "dataGolden"]) {
      this.setState({ [prop]: this.props.session[prop] });
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values["quality_data"] = this.state.quality_data;
        values["dataGolden"] = this.state.dataGolden;
        values["consent"] = this.state.consent;
        this.submit(values, this.props.session._id);
      }
    });
  };

  handleFileInputChange(_, results, stateProperty) {
    /* {@String} stateProperty: `this.state[stateProperty]` will store 
     * the uploded and parsed data. */
    const [e, file] = results[0];
    let data = [];
    let lineType;
    for (const line of e.target.result.replace(/\r/g, '').split('\n')) {
      switch (line) {
        case 'Context': {
          lineType = 'context';
          data.push({ sentid: data.length });
          break;
        }
        case 'Response': {
          lineType = 'response';
          break;
        }
        case 'Answer': {
          lineType = 'answer';
          break;
        }
        default: {
          if (line !== '') {
            let last = data[data.length - 1];
            if (lineType === 'response') {
              last.response = line;
            } else if (lineType === 'context') {
              last[lineType] = last[lineType] || [];
              last[lineType].push(
                { utterance: line, turn: last[lineType].length + 1 }
              );
            } else if (lineType === 'answer') {
              last[lineType] = last[lineType] || [];
              last[lineType].push(line);
            }
          }
        }
      }
    }
    if (data.length > 0) {
      message.success(`${data.length} dialogs are loaded!`);
    }
    this.setState({ [stateProperty]: data });
  }

  render() {
    const textStyleExtras = [
      {
        name: 'Context',
        fieldName: 'context',
        explain: "Set the style of the dialogue context shown to workers."
      },
      {
        name: 'Response',
        fieldName: 'response',
        explain: "Set the style of the dialogue response shown to workers."
      },
      {
        name: 'Questions',
        fieldName: 'question',
        explain: "Set the style of the text in each question."
      }
    ];
    return (
      <div>
        <h2 style={{ "padding-left": "1%" }}>Template for a Quality Task</h2>
        <p style={{ "padding-left": "1%" }}>This template is used for the creation of tasks that require the workers to assess the quality of the conversation.
          You can give the worker one or more conversations, and ask questions about those conversations.</p>
        <Form onSubmit={this.handleSubmit}>
          {this._showGeneralConfig()}
          {this._showConsentConfig()}
          {this._showDataConfig()}
          {this._showQualityControlConfig('conversation')}
          {this._showSurveyConfig()}
          {this._showFeedbackConfig()}
          {this._showAppearanceConfig(textStyleExtras)}
          {this._showButtons()}
        </Form>
      </div>
    );
  }

  _showDataUpload(golden = false) {
    const { formItemLayout } = this;
    let columns_dialog = [
      {
        title: 'ID',
        dataIndex: 'sentid',
        key: 'sendid',
        width: 100,
      },
      {
        title: 'Response',
        dataIndex: 'response',
        key: 'response',
      }
    ];
    if (golden) {
      columns_dialog.push({
        title: 'Answer',
        dataIndex: 'answer',
        key: 'answer',
        render: answers => answers.join('; ')
      });
    }
    const columns_context = [
      {
        title: 'Turn',
        dataIndex: 'turn',
        key: 'turn',
      },
      {
        title: 'Context Utterance',
        dataIndex: 'utterance',
        key: 'utterance'
      }
    ];
    const stateProperty = golden ? 'dataGolden' : 'quality_data';
    let example;
    if (!golden) {
      example = <>
        <div>Context</div>
        <div>System: How are you doing today?</div>
        <div>User: I'm doing great; how about you?</div>
        <div>Response</div>
        <div>System: I'm also doing well.</div>
      </>;
    } else {
      example = <>
        <div>Context</div>
        <div>System: How are you doing today?</div>
        <div>User: I'm doing great; how about you?</div>
        <div>Response</div>
        <div>System: I'm also doing well.</div>
        <div>Answer</div>
        <div>Answer to the 1st question for a dialog.</div>
        <div>Answer to the 2st question for a dialog.</div>
      </>;
    }

    return (<>
      <FormItem {...formItemLayout}
        label={(
          <span>
            {golden ? "Upload data with answer" : "Upload your data"} &nbsp;
            <Tooltip title={
              <div>
                <div>Please format your data as below, separated with new lines:</div>
                {example}
                {golden ? <div><b>It's is recommended that the number of golden is 10%
                          of the number of the data to be annotated.</b></div> : null}
              </div>
            }>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
      >
        <FileReaderInput
          as='text'
          onChange={(e, results) => this.handleFileInputChange(e, results, stateProperty)}
        >
          <Button
            style={{ width: '90%' }}
          >
            <UploadOutlined /> Click to Upload
          </Button>
        </FileReaderInput>
        <div>
          {(this.state.quality_data || []).length > 0 && golden ? <b>
            It is recommended to have at least {Math.ceil(this.state.quality_data.length / 10)} golden data.</b> : null
          }
        </div>
      </FormItem>
      {(this.state[stateProperty] || []).length > 0 ? <div>
        <div title={"Your Data"} height={500}>
          <Table rowKey="sentence" dataSource={this.state[stateProperty]}
            columns={columns_dialog} pagination={{ hideOnSinglePage: true }} size="small"
            expandedRowRender={record => <Table dataSource={record.context} pagination={{ hideOnSinglePage: true }} columns={columns_context} />} />
        </div>
      </div> : null
      }
      <br />
    </>);
  }

  _showDataConfig() {
    const { formItemLayout } = this;
    return (<>
      <h3 style={{ "padding-left": "1%" }}>Data</h3>
      <p style={{ "padding-left": "1%" }}>The data you want the workers to annotate.</p>
      <div style={{
        border: "2px solid black",
        margin: "10px",
        padding: 24
      }}>
        {this._showDataUpload(false)}
        {this._showAnnotationConfig("conversation", (this.state.quality_data || []).length)}
      </div>

    </>);
  }

  _showButtons() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <div style={{ "text-align": "center", "padding-left": "60px", "padding-top": "2%" }}>
        <span style={{ "margin-left": "-13%" }}>Please save before you preview</span>
      </div>
      <FormItem {...formItemLayoutWithOutLabel}>
        <Button
          type="primary" style={{ width: '71.5%' }} htmlType="submit">Save</Button> {" "}
        <Button
          onClick={() => window.open(clientUrl + "/worker_quality?MID=dialcrowd&ID=" + this.props.session._id)}
          style={{ width: '18%' }}><EyeOutlined /> Preview
        </Button>

        <br />
        {/* {this._showVisibility()} */}
        <Button type="primary" style={{ width: '90%' }}
          onClick={() => this._saveAsJSON()}
        >
          Save Configuration as JSON
        </Button>

        <div style={{ "padding-top": "2%" }}>
          <QualityTemplate thisstate={this.props.session} />
        </div>
      </FormItem>


    </>);
  }

  _showTemplate() { }

}

function mapStateToProps(state) {
  return {
    session: state.session_quality,
  };
}

const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(QualityConfigure));
