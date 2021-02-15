import React, { Component } from 'react'
import { Button, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons'
import { connect } from "react-redux";
import { saveAs } from 'file-saver';
import { new_project_data } from "../../../../actions/crowdAction";
import { loadData } from "../../../../actions/sessionActions";
import { serverUrl } from "../../../../configs";

function get_quality_results(t) {
  fetch(serverUrl + '/api/get/result/quality/' + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      console.log("json", json);

      let detail = [];
      let subsubdetail = [];
      let annotators = [];
      let intermediate = {};
      let sentence_dic = {};
      let ids = [];

      json.response.forEach(function (data, index) {
        //each sentence
        annotators = [];
        data.meta.forEach(function (data1, index1) {
          //each annotator
          if (!(annotators.includes(data1.submissionID))) {
            annotators.push(data1.submissionID);
            subsubdetail = [];
            Object.keys(data1.responses).forEach(function (key) {
              subsubdetail.push({ "question": key.split("|||")[1], "response": data1.responses[key] })
            })
            if (data.sentid in intermediate) {
              intermediate[data.sentid].push({ "submissionID": data1.submissionID, "annotator": data1.annotator, "detail": subsubdetail });
            }
            else {
              sentence_dic[data.sentid] = data1.response
              ids.push(data.sentid);
              intermediate[data.sentid] = [{ "submissionID": data1.submissionID, "annotator": data1.annotator, "detail": subsubdetail }];
            }
          }
        })
      })

      ids.sort();

      ids.forEach(function (id) {
        detail.push({ "response": sentence_dic[id], "sentid": id, "num": intermediate[id].length, "detail": intermediate[id] })
      })

      t.setState({
        results: json.response,
        results_detail: detail
      });
    });
}

class QualityResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
      results_detail: [],
      results: []
    }
  }

  componentDidMount() {
    get_quality_results(this);
  }

  render() {
    const detail_subcolumns = [
      {
        title: 'Annotator',
        dataIndex: 'annotator',
        key: 'annotator'
      },
      {
        title: 'Submission ID',
        dataIndex: 'submissionID',
        key: 'submissionID'
      },
    ];
    const detail_subsubcolumns = [
      {
        title: 'question',
        dataIndex: 'question',
        key: 'question'
      },
      {
        title: 'response',
        dataIndex: 'response',
        key: 'response'
      }
    ]
    const detail_columns = [
      {
        title: 'Sentence',
        dataIndex: 'sentid',
        key: 'sentid'
      },
      {
        title: 'Response',
        dataIndex: 'response',
        key: 'response'
      },
      {
        title: 'submissions',
        dataIndex: 'num',
        key: 'num'
      }

    ];

    return <div>
      <Button
        onClick={() => {
          var blob = new Blob(
            [JSON.stringify(this.state.results_detail, null, 2)],
            { type: 'text/plain;charset=utf-8' },
          )
          saveAs(blob, "result.json")
        }}
      >
        <DownloadOutlined /> Download Submissions
      </Button>
      <br></br>
      <br></br>
      <h1>Results</h1>
      <Table rowKey="userId" dataSource={this.state.results_detail} pagination={{ hideOnSinglePage: true }} columns={detail_columns} size="small"
        expandedRowRender={record => <Table dataSource={record.detail} pagination={{ hideOnSinglePage: true }} columns={detail_subcolumns}
          expandedRowRender={record2 => <Table dataSource={record2.detail} pagination={{ hideOnSinglePage: true }} columns={detail_subsubcolumns} />} />}
      />
    </div>
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(QualityResult);

