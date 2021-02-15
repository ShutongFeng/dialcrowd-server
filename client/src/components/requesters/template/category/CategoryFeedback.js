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
      let workerFeedback = {};

      for (const unit of json.response) {
        for (const annotation of unit.result) {
          if (annotation.feedback !== null) {
            workerFeedback[annotation.submissionID] = annotation.feedback;
          }
        }
      }
      let feedbacks = [];
      for (const [uid, feedback] of Object.entries(workerFeedback)) {
        feedbacks.push({ userId: uid, feedback: feedback })
      }
      t.setState({
        feedbacks: feedbacks
      });
    });
}

class CategoryFeedback extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feedback: []
    }
  }

  componentDidMount() {
    get_category_results(this);
  }

  render() {
    get_category_results(this);
    const columns = [
      {
        title: 'user id',
        dataIndex: 'userId',
        key: 'userId'
      },
      {
        title: 'feedback',
        dataIndex: 'feedback',
        key: 'feedback'
      }
    ];

    return <div>
      <Button
        onClick={() => {
          var blob = new Blob(
            [JSON.stringify(this.state.feedbacks, null, 2)],
            { type: 'text/plain;charset=utf-8' },
          )
          saveAs(blob, "category_feedback.json")
        }}
      >
        <DownloadOutlined /> Download Feedback
      </Button>
      <br></br>
      <br></br>
      <h1>Feedback </h1>
      <Table rowKey="userId" dataSource={this.state.feedbacks} columns={columns} size="small" />
    </div>;
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryFeedback);

