import React from "react";
import { deleteResult, getResult } from "../../../../actions/crowdAction";
import { connect } from "react-redux";
import { serverUrl } from "../../../../configs";
import { Button, Table } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";

function get_interactive_results(t) {
  fetch(
    serverUrl +
      "/api/result/interactive/" +
      t.props.session._id +
      "/flyingbroom"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      let feedbacks = [];
      for (const annotation of json.unit[0].annotations) {
        for (const survey of annotation.survey) {
          if (survey.Name === "FEEDBACK") {
            feedbacks.push({ userID: annotation.userID, feedback: survey.A });
          }
        }
      }
      t.setState({
        feedbacks: feedbacks,
      });
    });
}

class InteractiveFeedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      feedbacks: [],
    };
  }

  componentDidMount() {
    this.props.getResult("interactive", this.props.session._id);
    get_interactive_results(this);
    setInterval(() => get_interactive_results(this), 5000);
  }

  render() {
    const feedback_detail_col = [
      {
        title: "user id",
        dataIndex: "userID",
        key: "userID",
      },
      {
        title: "feedback",
        dataIndex: "feedback",
        key: "feedback",
      },
    ];

    return (
      <div>
        <Button
          onClick={() => {
            var blob = new Blob(
              [JSON.stringify(this.state.feedbacks, null, 2)],
              { type: "text/plain;charset=utf-8" }
            );
            saveAs(blob, "interactive_feedback.json");
          }}
        >
          <DownloadOutlined /> Download Feedback
        </Button>
        <br></br>
        <br></br>

        <h1>Feedback </h1>
        <Table
          rowKey="userId"
          dataSource={this.state.feedbacks}
          columns={feedback_detail_col}
          size="small"
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    dialog: state.result.dialog,
    survey: state.result.survey,
    session: state.session_interactive,
  };
}

const mapDispatchToProps = {
  getResult: getResult,
  deleteResult: deleteResult,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InteractiveFeedback);
