import React from "react";
import { Button, Modal, Table } from "antd";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import { ChatFeed, Message } from "react-chat-ui";
import { deleteResult, getResult } from "../../../../actions/crowdAction";
import { connect } from "react-redux";
import { serverUrl } from "../../../../configs";

function get_interactive_results(t) {
  fetch(
    serverUrl +
      "/api/get/result/interactive/" +
      t.props.session._id +
      "/flyingbroom"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      let system_survey = {};
      let overall_survey = {};
      let system_survey_type = [];
      let overall_survey_type = [];

      json.survey.forEach(function (data, index) {
        data.survey.forEach(function (question, index2) {
          if (question.Name === "EXIT") {
            if (question.Q in overall_survey) {
              overall_survey[question.Q].push({
                userId: data.userID,
                answer: question.A,
              });
            } else {
              overall_survey[question.Q] = [
                { userId: data.userID, answer: question.A },
              ];
            }
            if (question.Type.indexOf("Likert") >= 0) {
              overall_survey_type.push(question.Q);
            }
          } else if (question.Name !== "FEEDBACK") {
            if (question.Q in system_survey) {
              system_survey[question.Q].push({
                userId: data.userID,
                answer: question.A,
                system: question.Name,
              });
            } else {
              system_survey[question.Q] = [
                {
                  userId: data.userID,
                  answer: question.A,
                  system: question.Name,
                },
              ];
            }
            if (question.Type.indexOf("Likert") >= 0) {
              system_survey_type.push(question.Q);
            }
          }
        });
      });

      let new_system_survey = [];
      let new_overall_survey = [];
      Object.keys(overall_survey).forEach(function (key) {
        let avg_rate = "";
        if (overall_survey_type.includes(key)) {
          avg_rate = 0;
          overall_survey[key].forEach(function (data, index) {
            avg_rate += data.answer;
          });
          avg_rate /= overall_survey[key].length;
        }
        new_overall_survey.push({
          survey_question: key,
          detail: overall_survey[key],
          num: overall_survey[key].length,
          rating: avg_rate,
        });
      });
      Object.keys(system_survey).forEach(function (key) {
        let avg_rate = "";
        if (system_survey_type.includes(key)) {
          avg_rate = 0;
          system_survey[key].forEach(function (data, index) {
            avg_rate += data.answer;
          });
          avg_rate /= system_survey[key].length;
        }
        new_system_survey.push({
          survey_question: key,
          detail: system_survey[key],
          num: system_survey[key].length,
          rating: avg_rate,
        });
      });

      let dialog = [];
      let int = {};
      json.dialog.forEach(function (data, index) {
        let messages = [];
        data.dialog.forEach(function (data2, index2) {
          if (data2.utter !== "START") {
            if (data2.role === "Bot") {
              messages.push(new Message({ id: 1, message: data2.utter }));
            }
            if (data2.role === "You") {
              messages.push(new Message({ id: 0, message: data2.utter }));
            }
          }
        });
        if (data.name_of_dialog in int) {
          int[data.name_of_dialog].push({
            userID: data.userID,
            dialog: messages,
          });
        } else {
          int[data.name_of_dialog] = [
            { userID: data.userID, dialog: messages },
          ];
        }
      });

      Object.keys(int).forEach(function (key) {
        dialog.push({
          name_of_dialog: key,
          num: int[key].length,
          detail: int[key],
        });
      });

      t.setState({
        system_survey: new_system_survey,
        overall_survey: new_overall_survey,
        dialog: dialog,
      });
    });
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      system_survey: [],
      overall_survey: [],
      dialog: [],
    };
  }

  componentDidMount() {
    this.props.getResult("interactive", this.props.session._id);
    get_interactive_results(this);
  }

  viewdialog = (e) => {
    this.setState({ messages: e });
    this.setState({ visible: true });
  };

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    const system_survey_col = [
      {
        title: "survey question",
        dataIndex: "survey_question",
        key: "survey_question",
      },
      {
        title: "submissions",
        dataIndex: "num",
        key: "num",
      },
      {
        title: "average rating",
        dataIndex: "rating",
        key: "rating",
      },
    ];
    const system_survey_detail_col = [
      {
        title: "user id",
        dataIndex: "userId",
        key: "userId",
      },
      {
        title: "answer",
        dataIndex: "answer",
        key: "answer",
      },
      {
        title: "system",
        dataIndex: "system",
        key: "system",
      },
    ];
    const overall_survey_col = [
      {
        title: "survey question",
        dataIndex: "survey_question",
        key: "survey_question",
      },
      {
        title: "submissions",
        dataIndex: "num",
        key: "num",
      },
      {
        title: "average rating",
        dataIndex: "rating",
        key: "rating",
      },
    ];
    const overall_survey_detail_col = [
      {
        title: "user id",
        dataIndex: "userId",
        key: "userId",
      },
      {
        title: "answer",
        dataIndex: "answer",
        key: "answer",
      },
    ];

    const columns_dialog = [
      {
        title: "Name of Bot",
        dataIndex: "name_of_dialog",
        key: "name_of_dialog",
      },
      {
        title: "submissions",
        dataIndex: "num",
        key: "num",
      },
    ];
    const columns_dialog_sub = [
      {
        title: "submissionID",
        dataIndex: "userID",
        key: "userID",
      },
      {
        title: "View",
        dataIndex: "operation",
        key: "operation",
        render: (text, record) => (
          <span className="table-operation">
            {
              <span>
                <a onClick={() => this.viewdialog(record.dialog)}>
                  <FileTextOutlined />
                  &nbsp; View Dialogs
                </a>
                <span className="ant-divider" />
              </span>
            }
          </span>
        ),
      },
    ];

    let final_survey = {
      system_survey: this.state.system_survey,
      overall_survey: this.state.overall_survey,
    };

    return (
      <div>
        <Modal
          title="Dialog View"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <ChatFeed
            messages={this.state.messages} // Boolean: list of message objects
            hasInputField={false} // Boolean: use our input, or use your own
            showSenderName // show the name of the user who sent the message
            bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
            // JSON: Custom bubble styles
            bubbleStyles={{
              text: {
                fontSize: 20,
              },
              chatbubble: {
                borderRadius: 35,
                padding: 20,
              },
            }}
          />
        </Modal>
        {/*<Button onClick={() => this.props.getResult("interactive", this.props.session._id)}>Refresh</Button>*/}
        <Button
          onClick={() => {
            var blob = new Blob([JSON.stringify(this.props.dialog, null, 2)], {
              type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "dialog.json");
          }}
        >
          <DownloadOutlined /> Download dialog
        </Button>
        <Button
          onClick={() => {
            var blob = new Blob([JSON.stringify(final_survey, null, 2)], {
              type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "interactive_survey.json");
          }}
        >
          <DownloadOutlined /> Download Survey
        </Button>
        <br></br>
        <br></br>
        <h1>Results</h1>
        <br></br>
        <br></br>
        <h1>Dialog</h1>
        <Table
          rowKey="userId"
          dataSource={this.state.dialog}
          columns={columns_dialog}
          size="small"
          expandedRowRender={(record) => (
            <Table dataSource={record.detail} columns={columns_dialog_sub} />
          )}
        />
        <h1>System Survey </h1>
        <Table
          rowKey="userId"
          dataSource={this.state.system_survey}
          columns={system_survey_col}
          size="small"
          expandedRowRender={(record) => (
            <Table
              dataSource={record.detail}
              columns={system_survey_detail_col}
            />
          )}
        />
        <h1>Overall Survey </h1>
        <Table
          rowKey="userId"
          dataSource={this.state.overall_survey}
          columns={overall_survey_col}
          size="small"
          expandedRowRender={(record) => (
            <Table
              dataSource={record.detail}
              columns={overall_survey_detail_col}
            />
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(Results);
