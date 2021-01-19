import React from "react";
import {Table} from 'antd';
import {deleteResult, getResult} from '../../../../actions/crowdAction';
import {connect} from "react-redux";
import {serverUrl} from "../../../../configs";

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

function get_interactive_results(t){
  fetch(serverUrl + '/api/get/result/interactive/' + t.props.session._id)
    .then(function (response) {
      return response.json();
    })
    .then(function (json){
      let times = [];
      let bonuses = [];
      let cost = 0;

      if (json.survey.length > 0){
        json.survey.forEach(function(data, index){
          if (data.times.length > 0){
            times.push({"userId": data.userID, "times": data.times});
          }
        })
  
        let all_times = [];
        let bonus_times = [];
  
        times.forEach(function(data, index){
          let durations = [];
          data.times.forEach(function(data2, index2){
            durations.push(data2.time/1000);
          })
  
          let sum_x = durations.reduce((a, b) => a + b, 0);
          all_times.push(sum_x);
          bonus_times[data.userId] = sum_x;
        })
  
        let average_time = getMean(all_times);
        Object.keys(bonus_times).forEach(function(key){
          if (bonus_times[key] > average_time){
            bonuses.push({"submissionID": key, "bonus": "$" + Number(Math.round(15 * (bonus_times[key] - average_time) / 3600+'e2') + 'e-2').toString()})
          }
          else{
            bonuses.push({"submissionID": key, "bonus": "$0.00"})
          }
        })
        cost = 15 * getMean(all_times) / 3600;
      }
      
  
      t.setState({
        cost: cost,
        bonus: bonuses
      })
    })
}

class InteractivePayment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      cost: 0
    }
  }

  componentDidMount() {
    this.props.getResult("interactive", this.props.session._id);
    get_interactive_results(this);
  }

  render() {
    get_interactive_results(this);

    const bonus_col = [
      {
        title: 'Submission ID',
        dataIndex: 'submissionID',
        key: 'submissionID',
      },
      {
        title: 'Suggested Bonus',
        dataIndex: 'bonus',
        key: 'bonus',
      }
    ]
    return <div>
      <h1>Recommend Reward per Assignment </h1>
      <p> = hourly wage ($15.00) * average time (sec) / (60 sec * 60 min)</p>
      <div style={{'text-align': 'center', 'font-size': '30px'}}>
          ${Math.round(this.state.cost * 100) / 100}
      </div>
      <br></br>
      <br></br>
      <h1>Suggested Bonuses</h1>
      <Table rowKey="submissionID" dataSource={this.state.bonus} columns={bonus_col} size="small"
        />
    </div>
  }
}


function mapStateToProps(state) {
  return {
    dialog: state.result.dialog,
    survey: state.result.survey,
    session: state.session_interactive
  };
}


const mapDispatchToProps = {
  getResult: getResult,
  deleteResult: deleteResult

};


export default connect(mapStateToProps, mapDispatchToProps)(InteractivePayment);



