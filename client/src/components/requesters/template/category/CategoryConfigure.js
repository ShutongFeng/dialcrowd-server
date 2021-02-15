import React from 'react';
import { Button, Form, InputNumber, message, Table, Tooltip } from 'antd';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { connect } from "react-redux";
import 'react-datasheet/lib/react-datasheet.css';
import FileReaderInput from 'react-file-reader-input';
import { clientUrl, serverUrl } from "../../../../configs";
import { loadData } from "../../../../actions/sessionActions";
import { new_project_data } from "../../../../actions/crowdAction";
import CategoryTemplate from "./CategoryTemplate";
import Configure from "../Configure.js"
import QuestionList, { addKeys, lists2Questions } from "../QuestionList.js";


const FormItem = Form.Item;

let label_index = 0;
let feedback_index = 0;

function Submit(t, data, id) {
  fetch(serverUrl + '/api/save/task/category/' + id, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.message === "success") {
        message.success("Success");
        t.props.loadData(t.props.session.createdAt, t.props.session.password, "category");
        t.props.new_project_data("category");
      }
      else {
        message.success("Fail");
      }
    });
}

function get_category_results(t) {
  fetch(serverUrl + '/api/get/result/category/' + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var responses = [];
      var sentence_ids = [];
      let grid = [];
      let row = [{ readOnly: true, value: '' }]
      Object.keys(json.kappa).forEach(x => {
        row.push({ value: x, readOnly: true })
      });
      grid.push(row);
      Object.keys(json.kappa).forEach(user1 => {
        let row = [{ readOnly: true, value: user1 }];
        Object.keys(json.kappa).forEach(user2 => {
          row.push({ value: json.kappa[user1][user2] })
        });
        grid.push(row);
      });
      console.log(grid);

      json.response.forEach(function (data, index) {
        if (!sentence_ids.includes(data.sentid)) {
          sentence_ids.push(data.sentid);
          responses.push(data);
        }
      });

      console.log(json.response);

      t.setState({
        results: responses,
        grid: grid
      });
    });
}

class CategoryConfigure extends Configure {
  handleSubmit = (e) => {
    /* Called when the submit button is clicked. */
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values["category_data"] = this.state.category_data;
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
    const [e, file] = results[0];
    let data1 = [];
    let lines = e.target.result.split("\n");
    if (targetStateProperty === 'category_data') {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === "")
          continue;
        let dic = {};
        dic["sentence"] = lines[i];
        dic["sentid"] = i + 1;
        dic["category"] = [];
        data1.push(dic);
      }
    } else {
      for (let i = 0; i < lines.length; i += 2) {
        if (lines[i] === "")
          continue;
        let dic = {};
        dic["sentence"] = lines[i];
        dic["sentid"] = i + 1;
        dic["answer"] = lines[i + 1];
        data1.push(dic);
      }
    }

    if (data1.length > 0) {
      message.success(data1.length + ' sentences are loaded!');
    }
    this.setState({ [targetStateProperty]: data1 });
  }

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      results_detail: [],
      hoveredCell: false,
      visible: false,
      visible_survey: false,
      taskid: "",
      generic_introduction: "",
      generic_instructions: "",
      category_data: [],
      results: [],
      visible_kappa: false,
      questionCategories: []
    }
    this.saveURL = '/api/save/task/category/';
    this.taskName = 'category';
  }

  makeProps() {
    if (this.props.session.questionCategories === undefined) {
      // Workaround
      const categories = this.props.session.classLabel || [];
      let questions = lists2Questions(
        categories,
        categories.map((_) => ('')),
        categories.map((_) => ([])),
        this.props.session.classExample,
        this.props.session.classCounterexample
      );
      this.setState({ questionCategories: questions });
    } else {
      this.setState(
        { "questionCategories": addKeys(this.props.session.questionCategories) }
      );
    }
    this.setState({
      category_data: this.props.session.category_data,
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
    ];

    return (<div>
      <h2 style={{ "padding-left": "1%" }} >Template for an Intent Classification Task </h2>
      <p style={{ "padding-left": "1%" }} >
        This template is used for the creation of tasks that require the workers to
        label the intent of utterances.
      </p>
      <form onSubmit={this.handleSubmit}>
        {this._showGeneralConfig()}
        {this._showAnnotationConfig("utterance")}
        {this._showDataConfig()}
        {this._showQualityControlConfig('utterance')}
        {this._showConsentConfig()}
        {this._showCategoryConfig()}
        {this._showFeedbackConfig()}
        {this._showAppearanceConfig(textStyleExtras)}
        {this._showButtons()}
      </form>
    </div>);
  }

  _showDataConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <FormItem
        {...formItemLayout}
        label={(
          <span>
            Num of sentences per page&nbsp;
            <Tooltip title="Sentences per worker per task">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
      >
        {getFieldDecorator('numofsent', { initialValue: this.state.numofsent })(
          <InputNumber min={1} max={100} style={{ height: "100%" }} />
        )}
      </FormItem>
      {/*
          <FormItem
          {...formItemLayout}
          label={(
          <span>
          Num of workers per sentence&nbsp;
          <Tooltip title="How many workers do you want to label per sentence?">
          <QuestionCircleOutlined />
          </Tooltip>
          </span>
          )}
          >
          {getFieldDecorator('numoflabel', {initialValue: this.props.session.numoflabel})(
          <InputNumber min={1} max={10}/>
          )}
          <span className="ant-form-text"> workers per sentence</span>
          </FormItem>
        */}
      {this._showDataUpload()}
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
      <div>Utterance 1. (Ex. I want to buy a ticket.)</div>
      <div>Intent of utterance 1. (Ex. Purchase)</div>
      <div>Utterance 2. (Ex. I want to buy a ticket.)</div>
      <div>Intent of utterance 2. (Ex. Purchase)</div>
      <div>...</div>
    </>) : 'Please split the utterances by new line.';
    const targetStateProperty = golden ? 'dataGolden' : 'category_data';

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

  _showCategoryConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const instruction = (
      "In this section, you can set up the types of intents the worker can choose from. "
      + "Remember to include examples and counterexamples. They help the worker get a "
      + "better idea what should be labeled as what type of intent, so you can collect data "
      + "of better quality."
    );
    return (<>
      <h3>Intent Type Configuration</h3>
      <p>{instruction}</p>
      <CategoryQuestionList
        form={this.props.form}
        formItemLayout={formItemLayout}
        removeByKey={this.removeByKey}
        addByKey={this.addByKey}
        updateByKey={this.updateByKey}
        questions={this.state.questionCategories}
        rootKey={["questionCategories"]}
        questionFieldLabel="Intent type"
        questionHelpText={(
          "Add an intent type that the worker can select."
        )}
        textAddQuestion="Add an Intent Type"
        textInstruction={instruction}
        placeholderQuestion="order_food"
        placeholderExample="I would like to order a pizza from Domino's."
        placeholderCounterexample="What's the temperature now?"
        noPreview={true}
      />
    </>
    );
  }

  _showButtons() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <div style={{ "text-align": "center", "padding-left": "10%" }}>
        <span>Please save before you preview</span>
      </div>
      <FormItem {...formItemLayoutWithOutLabel}>
        <Button type="primary" style={{ width: '90%' }} htmlType="submit">Save</Button>
        <Button onClick={() => window.open(clientUrl + "/worker_category?MID=unknown&ID=" + this.props.session._id)}
          type="primary" style={{ width: '90%' }}>Preview</Button>

        <br />
        {/* {this._showVisibility()} */}
        <Button type="primary" style={{ width: '90%' }}
          onClick={() => this._saveAsJSON()}
        >
          Save Configuration as JSON
        </Button>

        <div style={{ "padding-top": "5px" }}>
          <CategoryTemplate thisstate={this.props.session} />
        </div>
      </FormItem>
    </>);
  }
}


class CategoryQuestionList extends QuestionList {
  static questionTypes = [];
}



function mapStateToProps(state) {
  return {
    session: state.session_category,
  };
}

const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(CategoryConfigure));
