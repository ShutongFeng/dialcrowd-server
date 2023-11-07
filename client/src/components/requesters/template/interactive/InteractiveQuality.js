import {
  Hint,
  HorizontalGridLines,
  LineMarkSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
  ChartLabel,
} from "react-vis";
import React from "react";
import { Popconfirm, Table, Tooltip } from "antd";

import { deleteResult, getResult } from "../../../../actions/crowdAction";
import { connect } from "react-redux";
import { message } from "antd/lib/index";
import { serverUrl } from "../../../../configs";
import InteractiveDataStatistics from "./InteractiveDataStatistics";
import { getWorkerQuality } from "../category/CategoryQuality.js";

let DicUser = {};

let getMean = function (data) {
  return (
    data.reduce(function (a, b) {
      return Number(a) + Number(b);
    }) / data.length
  );
};
let getSD = function (data) {
  let m = getMean(data);
  return Math.sqrt(
    data.reduce(function (sq, n) {
      return sq + Math.pow(n - m, 2);
    }, 0) /
      (data.length - 1)
  );
};

function get_interactive_results(t) {
  fetch(serverUrl + "/api/get/result/interactive/" + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      let times = [];
      let results_detail = [];
      let all_times = [];
      let cost = 0;
      let likert_responses = [];
      let radio_responses = [];

      if (json.survey.length > 0) {
        let user_abnormal = [];

        json.survey.forEach(function (data, index) {
          if (data.times.length > 0) {
            times.push({ userId: data.userID, times: data.times });

            likert_responses = [];
            radio_responses = [];
            data.survey.forEach(function (data2, index2) {
              if (data2["Type"].includes("Likert")) {
                likert_responses.push(data2["A"]);
              } else if (data2["Type"].includes("Radio")) {
                radio_responses.push(data2["A"]);
              }
            });

            if (
              (likert_responses.length > 1 &&
                likert_responses.every((val, i, arr) => val === arr[0])) ||
              (radio_responses.length > 1 &&
                radio_responses.every((val, i, arr) => val === arr[0]))
            ) {
              user_abnormal.push(true);
            } else {
              user_abnormal.push(false);
            }
          }
        });

        times.forEach(function (data, index) {
          let detail = [];
          let durations = [];
          data.times.forEach(function (data2, index2) {
            detail.push({
              system: data2.system,
              duration: data2.time / 1000,
              userId: data.userId,
            });
            durations.push(data2.time / 1000);
          });

          let sum_x = durations.reduce((a, b) => a + b, 0);
          all_times.push(sum_x);

          results_detail.push({
            allsame: "no",
            userId: data.userId,
            total_duration: sum_x,
            average_duration: getMean(durations),
            outlier: "no",
            std_duration: getSD(durations),
            detail: detail,
          });
        });

        let stdev = getSD(all_times);
        let mean = getMean(all_times);
        results_detail.forEach(function (data, index) {
          if (
            data["total_duration"] > mean + 2 * stdev ||
            data["total_duration"] < mean - 2 * stdev
          ) {
            results_detail[index]["outlier"] = "yes";
          }
          if (user_abnormal[index]) {
            results_detail[index]["allsame"] = "yes";
          }
        });

        cost = (15 * getMean(all_times)) / 3600;
      }

      const url =
        serverUrl +
        "/api/result/interactive/" +
        t.props.session._id +
        "/flyingbroom";
      return getWorkerQuality(url).then((workerQuality) => {
        let results = json.response;
        results_detail = results_detail.map((result) => ({
          ...result,
          ...workerQuality[result.userId],
        }));
        t.setState({
          times: times,
          results_detail: results_detail,
          cost: cost,
        });
      });
    });
}

// takes in this.state.results_detail
function gaussian(arg) {
  let items = [];
  arg.map((item, i) => {
    let avg = item["average_duration"];
    let total = item["total_duration"];
    let userId = item["userId"];
    DicUser[total] = userId;
    items.push(total);
  });

  if (items.length > 0) {
    let m = getMean(items);
    let std = getSD(items);
    let a = 1 / Math.sqrt(2 * Math.PI);
    let f = a / std;
    let p = -1 / 2;
    let finallist = [];
    if (isNaN(std)) {
      std = 1;
    }
    items.sort(function (a, b) {
      return a - b;
    });
    items.map((z, i) => {
      let c = (z - m) / std;
      c *= c;
      p *= c;
      let result =
        (1 / (Math.sqrt(2 * Math.PI) * std)) *
        Math.E ** (-0.5 * ((z - m) / std) ** 2);
      finallist.push({ x: z, y: result });
    });
    return finallist;
  }
  return [{ x: 1, y: 11 }];
}

function buildValue(hoveredCell) {
  const { v, userId } = hoveredCell;
  return {
    x: v.x,
    y: v.y,
    userId: userId,
  };
}

function remove_interactive_results(userId) {
  fetch(serverUrl + "/api/delete/result/interactive/" + userId).then(function (
    response
  ) {
    return response.json();
  });
}

class InteractiveQuality extends React.Component {
  handleDelete = (key) => {
    const dataSource = [...this.state.results_detail];
    const dataSource2 = [...this.state.system_survey];
    const dataSource3 = [...this.state.overall_survey];
    const dataSource4 = [...this.state.times];
    const dataSource5 = [...this.state.feedback];

    dataSource2.forEach(function (data, index) {
      let new_detail = [];
      data.detail.forEach(function (data2, index2) {
        if (data2.userId !== key) {
          new_detail.push(data2);
        }
      });
      dataSource2[index].detail = new_detail;
    });

    dataSource3.forEach(function (data, index) {
      let new_detail = [];
      data.detail.forEach(function (data2, index2) {
        if (data2.userId !== key) {
          new_detail.push(data2);
        }
      });
      dataSource3[index].detail = new_detail;
    });

    dataSource5.forEach(function (data, index) {
      let new_detail = [];
      data.detail.forEach(function (data2, index2) {
        if (data2.userId !== key) {
          new_detail.push(data2);
        }
      });
      dataSource5[index].detail = new_detail;
    });

    this.setState({
      results_detail: dataSource.filter((item) => item.userId !== key),
    });
    this.setState({
      system_survey: dataSource2.filter((item) => item.userId !== key),
    });
    this.setState({
      overall_survey: dataSource3.filter((item) => item.userId !== key),
    });
    this.setState({ times: dataSource4.filter((item) => item.userId !== key) });
    this.setState({
      feedback: dataSource5.filter((item) => item.userId !== key),
    });

    remove_interactive_results(key);
  };

  constructor(props) {
    super(props);
    this.state = {
      results: [],
      visible: false,
      visible_survey: false,
      system_survey: [],
      overall_survey: [],
      feedback: [],
      times: [],
      results_detail: [],
    };
  }

  componentDidMount() {
    this.props.getResult("interactive", this.props.session._id);
    get_interactive_results(this);
    setInterval(() => get_interactive_results(this), 5000);
  }

  handleOkSurvey = (e) => {
    console.log(e);
    this.setState({
      visible_survey: false,
    });
  };
  handleCancelSurvey = (e) => {
    console.log(e);
    this.setState({
      visible_survey: false,
    });
  };

  confirm = (record) => {
    this.props.deleteResult("interactive", this.props.session._id, record._id);
    message.success("Delete Success");
  };

  cancel = (e) => {
    console.log(e);
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
    // get_interactive_results(this);
    const detail_subcolumns = [
      {
        title: "system",
        dataIndex: "system",
        key: "system",
      },
      {
        title: "duration",
        dataIndex: "duration",
        key: "duration",
      },
    ];
    const detail_columns = [
      {
        title: "user id",
        dataIndex: "userId",
        key: "userId",
      },
      {
        title: "total",
        dataIndex: "total_duration",
        key: "total_duration",
      },
      {
        title: "average",
        dataIndex: "average_duration",
        key: "average_duration",
      },
      {
        title: "std",
        dataIndex: "std_duration",
        key: "std_duration",
      },
      {
        title: (
          <>
            outlier
            <Tooltip title="Whether the time spent on the task is 2 standard deviations above or below the average time taken.">
              <a>
                <sub>?</sub>
              </a>
            </Tooltip>
          </>
        ),
        dataIndex: "outlier",
        key: "outlier",
      },
      {
        title: (
          <>
            abnormal
            <Tooltip title="Whether some repeating pattern, like answering A, B, A, B ..., or A, A, A is detected.">
              <a>
                <sub>?</sub>
              </a>
            </Tooltip>
          </>
        ),
        dataIndex: "abnormal",
        key: "abnormal",
      },
      {
        title: (
          <>
            inter-user
            <Tooltip
              title={"The ratio of annotations that agree with the majority."}
            >
              <a>
                <sub>?</sub>
              </a>
            </Tooltip>
          </>
        ),
        dataIndex: "agreeMajor",
        key: "agreeMajor",
      },
      {
        title: "operation",
        dataIndex: "operation",
        render: (text, record) => {
          return this.state.results_detail.length > 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.userId)}
            >
              <a href="javascript:;">Delete</a>
            </Popconfirm>
          ) : null;
        },
      },
    ];

    return (
      <div>
        <p>
          We calculate the worker's time according to how long they interact
          with each system. Outlier is calculated by any worker who takes more
          than 2 standard deviations longer or shorter than the mean time taken
          for the task. This metric can be used to help determine if a worker
          may be a bot; however, we suggest that you pay the bot, block them
          from completing future HITs for you, and{" "}
          <a href="https://support.aws.amazon.com/#/contacts/aws-mechanical-turk">
            report
          </a>{" "}
          it to Amazon, which can also be done through "Report this HIT" on the
          MTurk interface. This is because rejecting the bot may hurt your
          requester reputation. Be sure to accept and reject your HITs in a
          timely manner and communicate with the workers if they have any
          questions. You can monitor your requester reputation on sites such as{" "}
          <a href="https://turkopticon.ucsd.edu/">Turkopticon</a>.
        </p>
        <h1>Workers' Timestamps Logs</h1>
        <Table
          rowKey="userId"
          dataSource={this.state.results_detail}
          columns={detail_columns}
          size="small"
          expandedRowRender={(record) => (
            <Table dataSource={record.detail} columns={detail_subcolumns} />
          )}
        />
        <h1>Agreements between Workers</h1>
        <InteractiveDataStatistics
          url={serverUrl + "/api/task/interactive/" + this.props.session._id}
          propertyNameQuestions="questions"
        />

        <h1>Gaussian of Timestamps</h1>
        <XYPlot width={300} height={300}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <ChartLabel
            text="total time interacted with system"
            className="alt-x-label"
            includeMargin={false}
            xPercent={0.25}
            yPercent={1.01}
          />
          <ChartLabel
            text="probability density"
            className="alt-y-label"
            includeMargin={false}
            xPercent={0.06}
            yPercent={0.06}
            style={{
              transform: "rotate(-90)",
              textAnchor: "end",
            }}
          />
          <LineMarkSeries
            className="linemark-series-example-2"
            curve={"curveMonotoneX"}
            data={gaussian(this.state.results_detail)}
            onValueMouseOver={(v) =>
              this.setState({
                hoveredCell:
                  v.x && v.y ? { v: v, userId: DicUser[v.x] } : false,
              })
            }
          />
          {this.state.hoveredCell ? (
            <Hint value={buildValue(this.state.hoveredCell)}>
              <div style={{ color: "black" }}>
                <b>
                  <strong> {"userId: " + this.state.hoveredCell.userId}</strong>
                </b>
              </div>
            </Hint>
          ) : null}
        </XYPlot>
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

export default connect(mapStateToProps, mapDispatchToProps)(InteractiveQuality);
