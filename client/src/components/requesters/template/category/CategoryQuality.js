import {Hint, HorizontalGridLines, LineMarkSeries, VerticalGridLines, XAxis, XYPlot, YAxis, ChartLabel} from 'react-vis';
import "react-vis/dist/style.css";
import React, {Component} from 'react'
import {Popconfirm, Table, Tooltip} from 'antd';
import {connect} from "react-redux";

import {new_project_data} from "../../../../actions/crowdAction";
import {loadData} from "../../../../actions/sessionActions";
import {serverUrl} from "../../../../configs";
import DataStatistics from "../DataStatistics";

let DicUser = {};


function getWorkerQuality (url) {
  /* Fetch worker quality metrics, e.g. agreeSelf, agreeGold.
   * Return: {@Promise}
   */
  return fetch(url).then(
    res => res.json()
  ).then(res => {
    // Collect annotations done by each worker.
    let workerUnits = {};  // workerUnits[workerId] = [annotations]
    for (const [idUnit, unit] of Object.entries(res.unit)) {
      for (const annotation of unit.annotations) {
        const idWorker = annotation.submissionID;
        workerUnits[idWorker] = workerUnits[idWorker] || [];
        workerUnits[idWorker].push(annotation);
      }
    }
    
    // Construct table rows for the workers.
    let workerQuality = {};
    for (const [idWorker, annotations] of Object.entries(workerUnits)) {
      let quality = {};  // A row for the worker.

      // aggregate for `abnormal` from annotations
      let abnormal = annotations.map(
        a => a.patternPeriod > 0
      ).reduce(
        (a, b) => (a || b), false
      );
      quality['abnormal'] = abnormal ? 'Yes' : 'No';

      // aggregate for `agreeSelf` and `agreeGold`.
      for (const metric of ['agreeSelf', 'agreeGold']) {
        // count where annotation[metric] is not undefined.
        let denominator = annotations.map(
          a => a[metric] !== null ? 1 : 0
        ).reduce(
          (a, b) => (a + b), 0
        );
        // count where annotation[metric] is yes.
        let numerator = annotations.map(
          a => a[metric] === true ? 1 : 0
        ).reduce(
          (a, b) => (a + b), 0
        );
        // convert result to the string to show.
        if (denominator === 0) {
          quality[metric] = '-/-';
        } else {
          quality[metric] = `${numerator} / ${denominator}`;
        }
      }
      // aggregate for `agreeMajor`.
      for (const metric of ['agreeMajor']) {
        // count where annotation[metric] is not undefined.
        let denominator = annotations.map(
          a => a[metric] !== undefined ? 1 : 0
        ).reduce(
          (a, b) => (a + b), 0
        );
        // count where annotation[metric] is yes.
        let numerator = annotations.map(
          a => a[metric] || 0
        ).reduce(
          (a, b) => (a + b), 0
        );
        // convert result to the string to show.
        if (denominator === 0) {
          quality[metric] = '-/-';
        } else {
          quality[metric] = (numerator / denominator).toFixed(2);
        }
      }
      workerQuality[idWorker] = quality;
    }
    return workerQuality;
  });    
}


function get_category_results(t) {
  fetch(serverUrl + '/api/get/result/category/' + t.props.session._id)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        let grid = [];
        let row = [{readOnly: true, value: ''}];
        let new_response = [];
        let feedback = {};
        
        if (json.response.length > 0){
          Object.keys(json.kappa).forEach(x => {
            row.push({value: x, readOnly: true})
          });
          grid.push(row);
          Object.keys(json.kappa).forEach(user1 => {
            let row = [{readOnly: true, value: user1}];
            Object.keys(json.kappa).forEach(user2 => {
              if (typeof json.kappa[user1][user2] === 'number') {
                row.push({value: json.kappa[user1][user2]})
              }
              else {
                row.push({value: null})
              }
            });
            grid.push(row);
          });
          console.log(grid);
  
          let sentids = [];
          Object.keys(json.response).forEach(x => {
            if (!(sentids.includes(json.response[x].sentid))){
              sentids.push(json.response[x].sentid);
              new_response.push(json.response[x]);
            }
          })
  
          let feedback_results = json.response[0].result;
          Object.keys(feedback_results).forEach(x => {
            Object.keys(feedback_results[x].feedback).forEach(y => {
              let q_index = feedback_results[x].feedback[y]["Q"];
              if (feedback_results[x].feedback_questions[q_index] in feedback){
                feedback[feedback_results[x].feedback_questions[q_index]].push({"feedback": feedback_results[x].feedback[y]["A"], "userId": feedback_results[x].submissionID})
              }
              else{
                feedback[feedback_results[x].feedback_questions[q_index]] = [{"feedback": feedback_results[x].feedback[y]["A"], "userId": feedback_results[x].submissionID}]
              }
            })
          })
        }
      
        let new_feedback = [];
        Object.keys(feedback).forEach(function(key){
          new_feedback.push({"feedback_question": key, "detail": feedback[key]})
        })

        t.setState({
          results: new_response,
          grid: grid,
          feedback: new_feedback
        });
      });
}

function remove_category_results(userId) {
  fetch(serverUrl + '/api/delete/result/category/' + userId)
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

function getDetail(t) {
  const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
  fetch(serverUrl + '/api/get/detail_result/category/' + t.props.session._id)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        let avg = []
        json["response"].forEach(x => {
          avg.push(x["total_duration"]);
        });

        const url = serverUrl + '/api/result/category/' + t.props.session._id;
        getWorkerQuality(url).then(workerQuality => {
          let detailResults = json.response;
          detailResults = detailResults.map(
            result => ({
              ...result,
              ...workerQuality[result.userId]
            })
          );
          t.setState({
            results_detail: detailResults,
            cost: 15 * average(avg) / 3600
          });
        });
      });
}

function buildValue(hoveredCell) {
  const {v, userId} = hoveredCell;
  return {
    x: v.x,
    y: v.y,
    userId: userId
  };
}

class CategoryQuality extends Component {
  handleDelete = (key) => {
    const dataSource = [...this.state.results_detail];
    const dataSource2 = [...this.state.results];
    const dataSource3 = [...this.state.feedback];

    dataSource3.forEach(function(data, index){
      let new_detail = [];
      data.detail.forEach(function(data2, index2){
        if (data2.userId !== parseInt(key)){
          new_detail.push(data2);
        }
      })
      dataSource3[index].detail = new_detail;
    })

    this.setState({results_detail: dataSource.filter(item => item.userId !== key)});
    this.setState({results: dataSource2.filter(item => item.userId !== key)});
    this.setState({feedback: dataSource3.filter(item => item.userId !== key)});

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
      feedback: []
    }
  }

  updateWorkerQuality () {
    /* Attach worker quality metrics, e.g. agreeSelf, agreeGold, to 
     * `this.state.results_detail`. 
     */
    const url = serverUrl + '/api/result/category/' + this.props.session._id;
    getWorkerQuality(url).then(workerQuality => {
      let detailResults = this.state.results_detail.slice();  // copy from state.
      detailResults = detailResults.map(
        result => ({
          ...result,
          ...workerQuality[result.userId]
        })
      );
      this.setState({results_detail: detailResults});
    });
  }
      
  componentDidMount() {
    getDetail(this);
    this.updateWorkerQuality();
    /* get_category_results(this); */
    
    setInterval(() => {
      getDetail(this);
      this.updateWorkerQuality();
    }, 2000);
    
  }

  render() {
    const detail_subcolums = [
      {
        title: 'Sentence',
        dataIndex: 'sentence',
        key: 'sentence'
      },
      {
        title: 'label',
        dataIndex: 'label',
        key: 'label'
      },
      {
        title: 'duration',
        dataIndex: 'duration',
        key: 'duration'
      },
      {
        title: 'timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp'
      },
    ];
    const detail_colums = [
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
      <p>We calculate the worker's time according to how long they take in selecting the intent for each question. 
        Abnormality is described as any worker who selects the same intent for every sentence and outlier is calculated 
        by any worker who takes more than 2 standard deviations longer or shorter than the mean time taken for the task. 
        These two metrics can be used to help determine if a worker may be a bot; however, we suggest that you pay the bot, 
        block them from completing future HITs for you, and <a href="https://support.aws.amazon.com/#/contacts/aws-mechanical-turk">report</a> it to Amazon,
        which can also be done through "Report this HIT" on the MTurk interface. This is because rejecting the bot may hurt your 
        requester reputation. Be sure to accept and reject your HITs in a timely manner and communicate with the workers if they have any questions. 
        You can monitor your requester reputation on sites such as <a href="https://turkopticon.ucsd.edu/">Turkopticon</a>.
      </p>
      <h1>Workers' Timestamps Logs</h1>
      <Table rowKey="userId" dataSource={this.state.results_detail} columns={detail_colums} size="small"
             expandedRowRender={record => <Table dataSource={record.detail} columns={detail_subcolums}/>}
      />
      
      <h1>Agreement between Workers</h1>
      <DataStatistics
        url={serverUrl + '/api/task/category/' + this.props.session._id}
        questions={['Intent']}
      />

      <h1>Gaussian of Timestamps</h1>
      <XYPlot
        width={300}
        height={300}>
        <VerticalGridLines/>
        <HorizontalGridLines/>
        <XAxis/>
        <YAxis/>
        <ChartLabel
          text="total time to select intents"
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
    session: state.session_category,
  };
}

const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryQuality);
export {getWorkerQuality};

