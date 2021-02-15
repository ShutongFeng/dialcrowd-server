import React, { Component } from 'react'
import { Button, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons'
import { connect } from "react-redux";
import { saveAs } from 'file-saver';
import { new_project_data } from "../../../../actions/crowdAction";
import { loadData } from "../../../../actions/sessionActions";
import { serverUrl } from "../../../../configs";

function get_sequence_results(t) {
  fetch(serverUrl + '/api/get/result/sequence/' + t.props.session._id)
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
        let sentence = data.sentence;
        data.meta.forEach(function (data1, index1) {
          //each annotator
          if (!(annotators.includes(data1.submissionID))) {
            annotators.push(data1.submissionID);
            subsubdetail = [];
            data.entity[index1].forEach(function (data2, index2) {
              subsubdetail.push({ "entity": data2.type, "label": data2.value })
            })
            if (sentence in intermediate) {
              intermediate[sentence].push({ "submissionID": data1.submissionID, "annotator": data1.annotator, "detail": subsubdetail });
            }
            else {
              sentence_dic[data.sentid] = sentence
              ids.push(data.sentid);
              intermediate[sentence] = [{ "submissionID": data1.submissionID, "annotator": data1.annotator, "detail": subsubdetail }];
            }
          }
        })
      })

      ids.sort();

      ids.forEach(function (id) {
        detail.push({ "sentence": sentence_dic[id], "sentid": id, "num": intermediate[sentence_dic[id]].length, "detail": intermediate[sentence_dic[id]] })
      })

      t.setState({
        results: json.response,
        results_detail: detail
      });
    });
}

class SequenceResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
      results_detail: [],
      results: []
    }
  }

  componentDidMount() {
    get_sequence_results(this);
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
        title: 'entity',
        dataIndex: 'entity',
        key: 'entity'
      },
      {
        title: 'label',
        dataIndex: 'label',
        key: 'label'
      }
    ]
    const detail_columns = [
      {
        title: 'SentID',
        dataIndex: 'sentid',
        key: 'sentid',
        width: 100,
      },
      {
        title: 'Sentence',
        dataIndex: 'sentence',
        key: 'sentence'
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
      <Table rowKey="userId" dataSource={this.state.results_detail} columns={detail_columns} size="small"
        expandedRowRender={record => <Table dataSource={record.detail} columns={detail_subcolumns}
          expandedRowRender={record2 => <Table dataSource={record2.detail} columns={detail_subsubcolumns} />} />}
      />
    </div>
  }
}

function mapStateToProps(state) {
  return {
    session: state.session_sequence,
  };
}

const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(SequenceResult);

