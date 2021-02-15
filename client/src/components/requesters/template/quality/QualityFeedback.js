import React, { Component } from 'react'
import { Button, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
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
      let feedback = []

      if (json.response.length > 0) {
        for (const annotation of json.response[0].meta) {
          feedback = feedback.concat(
            Object.values(annotation.feedback).map(
              feedback => ({ userId: annotation.submissionID, feedback: feedback })
            )
          );
        }
      }
      t.setState({
        feedback: feedback
      });
    });
}

class QualityFeedback extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feedback: []
    }
  }

  componentDidMount() {
    get_quality_results(this);
    setInterval(() => get_quality_results(this), 5000);
  }

  render() {
    const feedback_detail_col = [
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
            [JSON.stringify(this.state.feedback, null, 2)],
            { type: 'text/plain;charset=utf-8' },
          )
          saveAs(blob, "quality_feedback.json")
        }}
      >
        <DownloadOutlined /> Download Feedback
      </Button>
      <br></br>
      <br></br>
      <h1>Feedback </h1>
      <Table rowKey="userId" dataSource={this.state.feedback} columns={feedback_detail_col} pagination={{ hideOnSinglePage: true }} size="small"
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

export default connect(mapStateToProps, mapDispatchToProps)(QualityFeedback);
