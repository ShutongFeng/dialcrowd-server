import "react-vis/dist/style.css";
import React, { Component } from 'react'
import { Button, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons'
import { connect } from "react-redux";
import { saveAs } from 'file-saver';

import { new_project_data } from "../../../../actions/crowdAction";
import { loadData } from "../../../../actions/sessionActions";
import { serverUrl } from "../../../../configs";

function get_category_results(t) {
  fetch(serverUrl + '/api/get/result/category/' + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var initial = {};
      var responses = [];

      json.response.forEach(function (data, index) {
        if (!(data.sentid in initial)) {
          initial[data.sentid] = data
        }
      });

      var keys = Object.keys(initial);
      keys.sort();

      for (var i = 0; i < keys.length; i++) {
        initial[keys[i]].result.forEach(function (data, index) {
          delete initial[keys[i]].result[index]["feedback"];
          delete initial[keys[i]].result[index]["feedback_questions"];
        })
        responses.push(initial[keys[i]])
      }
      t.setState({
        results: responses,
      });
    });
}

class CategoryResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
      results: []
    }
  }

  componentDidMount() {
    get_category_results(this);
  }

  render() {
    get_category_results(this);

    const columns_results = [
      {
        title: 'SentID',
        dataIndex: 'sentid',
        key: 'sendid',
        width: 100,
      },
      {
        title: 'Text',
        dataIndex: 'sentence',
        key: 'sentence',
      },
      {
        title: 'Num of Submissions',
        dataIndex: 'num',
        key: 'num',
      },
    ];

    const subcolumns = [
      {
        title: 'Intent',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: 'Annotator',
        dataIndex: 'annotator',
        key: 'annotator',
      },
      {
        title: 'Submission ID',
        dataIndex: 'submissionID',
        key: 'submissionID',
      },
    ];

    return <div>
      <div title={"Your Data"} height={500}>
        <Button
          onClick={() => {
            var blob = new Blob(
              [JSON.stringify(this.state.results, null, 2)],
              { type: 'text/plain;charset=utf-8' },
            )
            saveAs(blob, "result.json")
          }}
        >
          <DownloadOutlined />Download Submissions
        </Button>
        <br></br>
        <br></br>
        <h1>Results</h1>
        <Table rowKey="sentid" dataSource={this.state.results} columns={columns_results} size="small"
          expandedRowRender={record => <Table dataSource={record.result} columns={subcolumns} pagination={false} />}
        />
      </div>
    </div>
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryResult);

