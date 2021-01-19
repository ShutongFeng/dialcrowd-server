import React, {Component} from 'react'
import {Button, Icon, Table} from 'antd';
import {connect} from "react-redux";
import {saveAs} from 'file-saver';

import {new_project_data} from "../../../../actions/crowdAction";
import {loadData} from "../../../../actions/sessionActions";
import {serverUrl} from "../../../../configs";

function get_sequence_results(t) {
  fetch(serverUrl + '/api/get/result/sequence/' + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      let workerFeedback = {};

      for (const unit of json.response) {
        for (const annotation of unit.meta) {
          if (annotation.feedback !== null) {
            workerFeedback[annotation.submissionID] = annotation.feedback;
          }
        }
      }
      let feedbacks = [];
      for (const [uid, feedback] of Object.entries(workerFeedback)) {
        feedbacks.push({userId: uid, feedback: feedback})
      }
      t.setState({
        feedbacks: feedbacks
      });
    });
}

class SequenceFeedback extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feedback: []
    }
  }

  componentDidMount() {    
    get_sequence_results(this);
    setInterval(
      () => get_sequence_results(this),
      5000
    );
  }

  render() {

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
                {type: 'text/plain;charset=utf-8'},
            )
            saveAs(blob, "sequence_feedback.json")
          }}
      >
        <Icon type='download'/> Download Feedback
      </Button>
      <br></br>
      <br></br>

      <h1>Feedback </h1>
      <Table rowKey="userId"
             dataSource={this.state.feedbacks}
             columns={columns}
             size="small"
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

export default connect(mapStateToProps, mapDispatchToProps)(SequenceFeedback);

