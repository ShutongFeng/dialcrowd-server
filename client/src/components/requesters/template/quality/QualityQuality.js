import {Hint, HorizontalGridLines, LineMarkSeries, VerticalGridLines, XAxis, XYPlot, YAxis, ChartLabel} from 'react-vis';
import "react-vis/dist/style.css";
import React, {Component} from 'react'
import {Popconfirm, Table, Tooltip, Icon} from 'antd';
import {connect} from "react-redux";

import {new_project_data} from "../../../../actions/crowdAction";
import {loadData} from "../../../../actions/sessionActions";
import {serverUrl} from "../../../../configs";
import DataStatistics from "../DataStatistics";

let DicUser = {};

let getMean = function (data) {
  return data.reduce(function (a, b) {
    return Number(a) + Number(b);
  }) / data.length;
};
let getSD = function (data) {
  let m = getMean(data);
  return Math.sqrt(data.reduce(function (sq, n) {
    return sq + Math.pow(n - m, 2);
  }, 0) / (data.length - 1));
};

function get_quality_results(t) {
  fetch(serverUrl + '/api/get/result/quality/' + t.props.session._id)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {

        let detail = [];
        let subsubdetail = [];
        let annotators = [];
        let intermediate = {};
        let all_times = [];
        let likert_responses = {};
        let radio_responses = {};

        if (json.response.length > 0){
          let user_abnormal = {};
          json.response.forEach(function(data, index){
            //each sentence
            annotators = [];
            data.meta.forEach(function(data1, index1){
              //each annotator
              if (!(annotators.includes(data1.submissionID))){
                annotators.push(data1.submissionID);
                let duration = data1.time/1000;
                subsubdetail = [];
                Object.keys(data1.responses).forEach(function(key){
                  if (key.split("|||")[0].includes("Likert")){
                    if (!(data1.submissionID in likert_responses)){
                      likert_responses[data1.submissionID] = [data1.responses[key]]
                    }
                    else{
                      likert_responses[data1.submissionID].push(data1.responses[key])
                    }
                    subsubdetail.push({"question": key.split("|||")[1], "response": data1.responses[key]})
                  }
                  else if (key.split("|||")[0].includes("Radio")){
                    if (!(data1.submissionID in radio_responses)){
                      radio_responses[data1.submissionID] = [data1.responses[key]]
                    }
                    else{
                      radio_responses[data1.submissionID].push(data1.responses[key])
                    }
                    subsubdetail.push({"question": key.split("|||")[1], "response": data1.responses[key]})
                  }
                })
                const detail = {
                  response: data1.response,
                  duration: duration,
                  detail: subsubdetail,
                  patternPeriod: data1.patternPeriod,
                  agreeSelf: data1.agreeSelf,
                  agreeGold: data1.agreeGold,
                  agreeMajor: data1.agreeMajor,
                };
                if (data1.submissionID in intermediate){
                  intermediate[data1.submissionID].push(detail);
                }
                else{
                  intermediate[data1.submissionID] = [detail];
                }                
              }
            })
          })

          // Object.keys(likert_responses).forEach(function(key){
          //   if (likert_responses[key].length > 1 && likert_responses[key].every( (val, i, arr) => val === arr[0] ) || radio_responses[key].length > 1 && radio_responses[key].every( (val, i, arr) => val === arr[0] )) {
          //     user_abnormal[key] = true
          //   }
          //   else{
          //     user_abnormal[key] = false
          //   }
          // })
          
          Object.keys(intermediate).forEach(function(key){
            let times = [];
            intermediate[key].forEach(function(data, index){
              times.push(data.duration);
            })
            
            let sum_x = times.reduce((a, b) => a + b, 0);
            let mean = getMean(times);
            let stdev = getSD(times);
            all_times.push(sum_x);

            // set abnormal to yes if any patternPeriod > 0
            let abnormal = 'no';
            let nAgreeUnit = {'agreeSelf': 0, 'agreeGold': 0};
            let nDisagreeUnit = {'agreeSelf': 0, 'agreeGold': 0};
            let agreeMajors = intermediate[key].map(a => a.agreeMajor)
                                               .filter(x => x !== undefined);
            let agreeMajor = agreeMajors.reduce((a, b) => (a + b), 0) / agreeMajors.length;
            for (const detail of intermediate[key]) {
              if (detail.patternPeriod > 0) {
                abnormal = 'yes';
              }
              // update agree test counters
              for (const agreeTest of Object.keys(nDisagreeUnit)) {
                if (detail[agreeTest] === false) {
                  nDisagreeUnit[agreeTest] += 1;
                } else if (detail[agreeTest] === true) {
                  nAgreeUnit[agreeTest] += 1;
                }
              }
            }

            let agreeSelfDetail = `${nAgreeUnit.agreeSelf}`
            + `/ ${nDisagreeUnit.agreeSelf + nAgreeUnit.agreeSelf}`
            let agreeGoldDetail = `${nAgreeUnit.agreeGold}`
            + `/ ${nDisagreeUnit.agreeGold + nAgreeUnit.agreeGold}`
            
            if (nDisagreeUnit.agreeSelf + nAgreeUnit.agreeSelf === 0){
              agreeSelfDetail = '--'
            }
            if (nDisagreeUnit.agreeGold + nAgreeUnit.agreeGold === 0){
              agreeGoldDetail = '--'
            }
            if (isNaN(agreeMajor)){
              agreeMajor = '--'
            }
            detail.push({
              "userId": key,
              "total_duration": sum_x.toFixed(3),
              "average_duration": mean.toFixed(3),
              "std_duration": stdev.toFixed(3),
              "detail": intermediate[key],
              "abnormal": abnormal,
              "agreeSelf": agreeSelfDetail,
              "agreeGold": agreeGoldDetail,
              "agreeMajor": agreeMajor,
              "outlier": "no",
              "num": intermediate[key].length
            });
          });
  
          let stdev = getSD(all_times);
          let mean = getMean(all_times);
          detail.forEach(function(data, index){
            if (data["total_duration"] > (mean + 2*stdev) || data["total_duration"] < (mean - 2*stdev)){
              detail[index]["outlier"] = "yes";
            }
            if (user_abnormal[data["userId"]]){
              detail[index]["allsame"] = "yes";
            }
          });
        } 

        t.setState({
          results: json.response,
          results_detail: detail,
        });
      });
}

function remove_category_results(userId) {
  fetch(serverUrl + '/api/delete/result/quality/' + userId)
      .then(function (response) {
        return response.json();
      })
}

// gaussian graph
function gaussian(arg) {
  let items = [];
  arg.map((item, i) => {
    let avg = item["average_duration"];
    let total = item["total_duration"];
    let userId = item["userId"];
    DicUser[total] = userId;
    items.push(total);
  });

  let getMean = function (data) {
    return data.reduce(function (a, b) {
      return Number(a) + Number(b);
    }) / data.length;
  };
  let getSD = function (data) {
    let m = getMean(data);
    return Math.sqrt(data.reduce(function (sq, n) {
      return sq + Math.pow(n - m, 2);
    }, 0) / (data.length - 1));
  };

  if (items.length > 0) {
    let m = getMean(items);
    let std = getSD(items);
    let a = 1 / Math.sqrt(2 * Math.PI);
    let f = a / std;
    let p = -1 / 2;
    let finallist = [];
    if (isNaN(std)){
      std = 1;
    }
    items.sort(function (a, b) {
      return a - b
    });
    items.map((z, i) => {
      let c = (z - m) / std;
      c *= c;
      p *= c;
      let result = 1 / (Math.sqrt(2 * Math.PI) * std) * Math.E ** (-0.5 * ((z - m) / std) ** 2);
      finallist.push({x: z, y: result});
    });
    return finallist;
  }
  return [{x: 1, y: 11}];
}

function buildValue(hoveredCell) {
  const {v, userId} = hoveredCell;
  return {
    x: v.x,
    y: v.y,
    userId: userId
  };
}

class QualityQuality extends Component {
  handleDelete = (key) => {
    const dataSource = [...this.state.results_detail];
    const dataSource2 = [...this.state.results];

    const dataSource3 = [];
    if (this.state.feedback && this.state.feedback.length > 0){
      const dataSource3 = [...this.state.feedback];

      dataSource3.forEach(function(data, index){
        let new_detail = [];
        data.detail.forEach(function(data2, index2){
          if (data2.userId !== key){
            new_detail.push(data2);
          }
        })
        dataSource3[index].detail = new_detail;
      })

      this.setState({feedback: dataSource3.filter(item => item.userId !== key)});
    }

    this.setState({results_detail: dataSource.filter(item => item.userId !== key)});
    this.setState({results: dataSource2.filter(item => item.userId !== key)});
    
    //this.setState({ grid: dataSource3.filter(item => item.userId !== key) });

    remove_category_results(key);

  }

  constructor(props) {
    super(props);
    this.state = {
      results_detail: [],
      survey: [],
      results: [],
      grid: [],
      cost: 0,
      visible_kappa: false,
    }
  }

  componentDidMount() {
    get_quality_results(this);
    setInterval(() => get_quality_results(this), 2000);
  }

  render() {
    /* get_quality_results(this); */
    const detail_subcolumns = [
      {
        title: 'Response',
        dataIndex: 'response',
        key: 'response'
      },
      {
        title: 'duration',
        dataIndex: 'duration',
        key: 'duration'
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
        title: 'user id',
        dataIndex: 'userId',
        key: 'userId'
      },
      {
        title: 'total',
        dataIndex: 'total_duration',
        key: 'total_duration',
      },
      {
        title: 'average',
        dataIndex: 'average_duration',
        key: 'average_duration'
      },
      {
        title: 'std',
        dataIndex: 'std_duration',
        key: 'std_duration'
      },
      {
        title: <>outlier
          <Tooltip title='Whether the time spent on the task is 2 standard deviations above or below the average time taken.' >
            <a><sub>?</sub></a>
          </Tooltip>
        </>,
        dataIndex: 'outlier',
        key: 'outlier'
      },
      {
        title: <>abnormal
          <Tooltip title='Whether some repeating pattern, like answering A, B, A, B ..., or A, A, A is detected.' >
            <a><sub>?</sub></a>
          </Tooltip>
        </>,
        dataIndex: 'abnormal',
        key: 'abnormal',
      },
      {
        title: <>intra-user
          <Tooltip title={(
            'The number of times the worker responded consistently'
            + '/ the number of duplicated task units given in each HIT.')} >
            <a><sub>?</sub></a>
          </Tooltip>
        </>,
        dataIndex: 'agreeSelf',
        key: 'agreeSelf'     
      },
      {
        title: <>agree-gold
          <Tooltip title={(
            'The number of correctly answered golden task units '
            + '/ the number of golden task units given in each HIT.')} >
            <a><sub>?</sub></a>
          </Tooltip>
        </>,
        dataIndex: 'agreeGold',
        key: 'agreeGold'     
      },
      {
        title: <>inter-user
          <Tooltip title={(
            'The ratio of annotations that agree with the majority.')} >
            <a><sub>?</sub></a>
          </Tooltip>
        </>,
        dataIndex: 'agreeMajor',
        key: 'agreeMajor'     
      },
      {
        title: 'submissions',
        dataIndex: 'num',
        key: 'num'
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (text, record) => {
          return (
              this.state.results_detail.length > 1
                  ? (
                      <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.userId)}>
                        <a href="javascript:;">Delete</a>
                      </Popconfirm>
                  ) : null
          );
        }
      }

    ];

    return <div>
      <p>We calculate the worker's time according to how long they take in selecting all the categories for the entities in the sentence. 
        Outlier is calculated by any worker who takes more than 2 standard deviations longer or shorter than the mean time taken for the task. 
        This metric can be used to help determine if a worker may be a bot; however, we suggest that you pay the bot, 
        block them from completing future HITs for you, and <a href="https://support.aws.amazon.com/#/contacts/aws-mechanical-turk">report</a> it to Amazon,
        which can also be done through "Report this HIT" on the MTurk interface. This is because rejecting the bot may hurt your 
        requester reputation. Be sure to accept and reject your HITs in a timely manner and communicate with the workers if they have any questions. 
        You can monitor your requester reputation on sites such as <a href="https://turkopticon.ucsd.edu/">Turkopticon</a>.
      </p>
      <h1>Workers' Timestamps Logs</h1>
      <Table rowKey="userId" dataSource={this.state.results_detail}
             columns={detail_columns}
             pagination={{hideOnSinglePage: true}}
             size="small"
             expandedRowRender={record => <Table dataSource={record.detail}
                                                 pagination={{hideOnSinglePage: true}}
                                                 columns={detail_subcolumns} 
                                                 expandedRowRender={record2 => <Table dataSource={record2.detail}
                                                                                      pagination={{hideOnSinglePage: true}} columns={detail_subsubcolumns}/>}/>}
      />
      <br/>
      <h1>Agreements between Workers</h1>
      <DataStatistics
        url={serverUrl + '/api/task/quality/' + this.props.session._id}
        urlResult={serverUrl + '/api/result/quality/' + this.props.session._id}
        propertyNameQuestions="questionSurveys"
      />
      <br/>
      <h1>Gaussian of Timestamps</h1>
      <XYPlot
        width={300}
        height={300}>
        <VerticalGridLines/>
        <HorizontalGridLines/>
        <XAxis/>
        <YAxis/>
        <ChartLabel
          text="total time to label sequences"
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
            transform: 'rotate(-90)',
            textAnchor: 'end'
          }}
        />
        <LineMarkSeries
          className="linemark-series-example-2"
          curve={'curveMonotoneX'}
          data={
          gaussian(this.state.results_detail)
          }
          onValueMouseOver={v => this.setState({hoveredCell: v.x && v.y ? {v: v, userId: DicUser[v.x]} : false})}
        />
        {this.state.hoveredCell ? <Hint value={buildValue(this.state.hoveredCell)}>
          <div style={{"color": "black"}}>
            <b><strong> {"userId: " + this.state.hoveredCell.userId}</strong></b>
          </div>
          </ Hint> : null}
      </XYPlot>
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

export default connect(mapStateToProps, mapDispatchToProps)(QualityQuality);

