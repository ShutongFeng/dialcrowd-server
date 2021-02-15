import React from 'react'
import { Button, Form, Table, Tooltip } from 'antd';
import { connect } from "react-redux";
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons'
import FileReaderInput from 'react-file-reader-input'
import { clientUrl, serverUrl } from "../../../../configs";
import { message } from "antd/lib/index";
import { loadData } from "../../../../actions/sessionActions";
import { getResult, new_project_data } from "../../../../actions/crowdAction";
import SequenceTemplate from "./SequenceTemplate";
import Configure from "../Configure.js";
import QuestionList, { addKeys, lists2Questions } from "../QuestionList.js";


const FormItem = Form.Item;
let label_index = 0;
let feedback_index = 0;

function getresults(t) {
  fetch(serverUrl + '/api/get/result/sequence/' + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      t.setState({
        results: json.response,
      });
    });
}


class SequenceConfigure extends Configure {
  handleSubmit = (e) => {
    /* Called when the submit button is clicked. */
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values["sequence_data"] = this.state.sequence_data;
        values["dataGolden"] = this.state.dataGolden;
        values["consent"] = this.state.consent;
        this.submit(values, this.props.session._id);
      }
      else {
        console.log(err);
      }
    });
  };

  handleFileInputChange(_, results, targetStateProperty) {
    if (targetStateProperty !== 'dataGolden') {
      const [e, file] = results[0]
      let data
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
        message.success(data1.length + ' sentences are loaded!');
      }
      this.setState({ sequence_data: data1 });
    } else {
      const [e, file] = results[0];
      let lines = e.target.result.split("\n");
      let data = [];
      for (var i = 0; i < lines.length / 2; i += 1) {
        if (lines[i * 2] == "")
          continue;
        // extract sentence
        const sent = lines[i * 2];
        // extract answers
        let entities = [];
        for (const seg of lines[i * 2 + 1].split(';')) {
          if (seg === '') continue;
          const entityType = seg.split(':')[0];
          const [start, end] = seg.split(':')[1].split(',');
          entities.push({
            start: parseInt(start), end: parseInt(end),
            entity: entityType
          })
        }
        data.push({
          sentid: i,
          sentence: sent,
          answer: entities
        });
      }
      this.setState({ dataGolden: data });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      sequence_data: [],
      survey: [],
      numofhit: 10,
      numoflabel: 3,
      results: [],
      questionEntities: []
    }
    this.saveURL = '/api/save/task/sequence/';
    this.taskName = 'sequence';
  }

  makeProps() {
    if (this.props.session.questionEntities === undefined) {
      // Workaround
      const labels = this.props.session.Label || [];
      let questions = lists2Questions(
        labels,
        labels.map((_) => ('')),
        labels.map((_) => ([])),
        this.props.session.Example,
        this.props.session.Counterexample
      );
      this.setState({ "questionEntities": questions });
    } else {
      this.setState(
        { "questionEntities": addKeys(this.props.session.questionEntities) }
      );
    }
    this.setState({
      sequence_data: this.props.session.sequence_data,
      dataGolden: this.props.session.dataGolden
    });
    super.makeProps();
  }

  render() {
    const textStyleExtras = [
      {
        name: 'Utterance',
        fieldName: 'utterance',
        explain: "Set the style of utterance to be annotated."
      },
      {
        name: 'Answer',
        fieldName: 'answer',
        explain: "Set the text style in workers' answer field."
      },
    ];

    return (<div>
      <h2 style={{ "padding-left": "1%" }} >Template for an Entity Labeling Task </h2>
      <p style={{ "padding-left": "1%" }} >
        This template is used for the creation of tasks that require the workers to
        annotate the entities present in an utterance.
        {/* You can have give the worker one or more conversations, and ask questions about
            those conversations. */}
      </p>
      <form onSubmit={this.handleSubmit}>
        {this._showGeneralConfig()}
        {this._showAnnotationConfig("sentence")}
        {this._showDataUpload()}
        {this._showQualityControlConfig('sentence')}
        {this._showConsentConfig()}
        {this._showEntityConfig()}
        {this._showFeedbackConfig()}
        {this._showAppearanceConfig(textStyleExtras)}
        {this._showButtons()}
      </form>
    </div>);
  }

  _showEntityConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const instruction = (
      "In this section, you can set up the types of entities the worker can choose from. "
      + "Remember to include examples and counterexamples. They help the worker get a "
      + "better idea what should be labeled as what type of entity, so you can collect data "
      + "of better quality."
    );
    return (<>
      <h3>Entity Types Configuration</h3>
      <p>{instruction}</p>
      <IntentQuestionList
        form={this.props.form}
        formItemLayout={formItemLayout}
        removeByKey={this.removeByKey}
        addByKey={this.addByKey}
        updateByKey={this.updateByKey}
        questions={this.state.questionEntities}
        rootKey={["questionEntities"]}
        questionFieldLabel="Entity type"
        questionHelpText={(
          "Add an entity type that the worker may choose from."
        )}
        textAddQuestion="Add an Entity Type"
        textInstruction={instruction}
        placeholderQuestion="Food"
        placeholderExample="Pizza"
        placeholderCounterexample="Car"
        noPreview={true}
      />
    </>);
  }

  _showDataUpload(golden = false) {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    let columns = [
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
      columns.push({
        title: 'Answer',
        dataIndex: 'answer',
        key: 'answer',
        render: answer => (answer.map(
          entity => `${entity.entity}:${entity.start},${entity.end};`
        ).join(''))
      });
    }

    const explain = golden ? (<>
      <div>Please format your data as below, separated with new lines:</div>
      <div>Sentence 1 (Ex. I want to have some thai food at cheap price.)</div>
      <div>Starta and end positions of the entities in sentence 1, with format entity_type1:start_pos,end_pos;entity_type2:start_pos,end_pos; (Ex. food_type:20,24;price_range:33:38;)</div>
      <div>Sentence 2 (Ex. I want to have some thai food at cheap price.)</div>
      <div>Starta and end positions of the entities in sentence 2, with format entity_type1:start_pos,end_pos;entity_type2:start_pos,end_pos;(Ex. food_type:20,24;price_range:33:38;)</div>
    </>) : 'Sentences should be split by new line. Please check the file format below';
    const targetStateProperty = golden ? 'dataGolden' : 'sequence_data';
    return (<>
      <FormItem {...formItemLayout} label={(
        <span>
          {golden ? 'Upload your golden data' : 'Upload your data'} &nbsp;
          <Tooltip title={explain}>
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
      )} >
        <FileReaderInput
          as='text'
          onChange={(e, results) => this.handleFileInputChange(e, results, targetStateProperty)}
        >
          <Button style={{ width: '90%' }}>
            <UploadOutlined /> Click to Upload
          </Button>
        </FileReaderInput>
      </FormItem>

      {(this.state[targetStateProperty] || []).length > 0 ? <div title={"Your Data"} height={500}>
        <Table rowKey="sentence" dataSource={this.state[targetStateProperty]} columns={columns}
          pagination={{ hideOnSinglePage: true }} size="small" />
      </div> : null}
    </>);
  }

  _showButtons() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <div style={{ "text-align": "center", "padding-left": "60px" }}>
        <span>Please save before you preview</span>
      </div>
      <FormItem {...formItemLayoutWithOutLabel}>
        <Button type="primary" style={{ width: '90%' }} htmlType="submit">Save</Button>
        <Button onClick={() => window.open(clientUrl + "/worker_sequence?MID=unknown&ID=" + this.props.session._id)}
          type="primary" style={{ width: '90%' }}>Preview</Button>

        <br />
        {/* {this._showVisibility()} */}
        <Button type="primary" style={{ width: '90%' }}
          onClick={() => this._saveAsJSON()}
        >
          Save Configuration as JSON
        </Button>

        <div style={{ "padding-top": "5px" }}>
          <SequenceTemplate thisstate={this.props.session} />
        </div>
      </FormItem>
    </>);
  }

}

class IntentQuestionList extends QuestionList {
  static questionTypes = [];
  render() {
    return (<>
      {super.render()}
      {/* <Form.Item {...this.formItemLayoutWithOutLabel}>
          <PreviewEntity questions={this.props.questions} />
          </Form.Item> */}
    </>);
  }
}

function mapStateToProps(state) {
  return {
    session: state.session_sequence,
    result: state.result,

  };
}


const mapDispatchToProps = {
  getResult: getResult,
  new_project_data: new_project_data,
  loadData: loadData,

};


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(SequenceConfigure));
