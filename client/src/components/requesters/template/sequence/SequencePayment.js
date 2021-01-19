import React, {Component} from 'react'
import {connect} from "react-redux";
import 'react-datasheet/lib/react-datasheet.css';
import {Table} from 'antd';

import {new_project_data} from "../../../../actions/crowdAction";
import {loadData} from "../../../../actions/sessionActions";
import {serverUrl} from "../../../../configs";

let getMean = function (data) {
  return data.reduce(function (a, b) {
    return Number(a) + Number(b);
  }) / data.length;
};

function get_sequence_results(t) {
  fetch(serverUrl + '/api/get/result/sequence/' + t.props.session._id)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {

        let subsubdetail = [];
        let annotators = [];
        let intermediate = {};
        let bonuses = [];
        let cost = 0;

        if (json.response.length > 0){
          json.response.forEach(function(data, index){
            //each sentence
            annotators = [];
            let sentence = data.sentence;
            data.meta.forEach(function(data1, index1){
              //each annotator
              if (!(annotators.includes(data1.submissionID))){
                annotators.push(data1.submissionID);
                let duration = data1.time/1000;
                subsubdetail = [];
                data.entity[index1].forEach(function(data2, index2){
                  subsubdetail.push({"entity": data2.type, "label": data2.value})
                })
                if (data1.submissionID in intermediate){
                  intermediate[data1.submissionID].push({"sentence": sentence, "duration": duration, "detail": subsubdetail});
                }
                else{
                  intermediate[data1.submissionID] = [{"sentence": sentence, "duration": duration, "detail": subsubdetail}];
                }
              }
            })
          })
  
          let all_times = [];
          let id_times = {};
  
          Object.keys(intermediate).forEach(function(key){
            let times = [];
            intermediate[key].forEach(function(data, index){
              times.push(data.duration);
            })
            
            let sum_x = times.reduce((a, b) => a + b, 0);
            all_times.push(sum_x);
            id_times[key] = sum_x;
          })
  
          let average_time = getMean(all_times);
  
          Object.keys(id_times).forEach(function(key){
            if (id_times[key] > average_time){
              bonuses.push({"submissionID": key, "bonus": "$" + Number(Math.round(15 * (id_times[key] - average_time) / 3600+'e2') + 'e-2').toString()})
            }
            else{
              bonuses.push({"submissionID": key, "bonus": "$0.00"})
            }
          })
          cost = 15 * getMean(all_times) / 3600
        }
        
        
        t.setState({
          cost: cost,
          bonus: bonuses
        });
      });
}

class SequencePayment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cost: 0
    }
  }

  componentDidMount() {
    get_sequence_results(this);
  }

  render() {
    get_sequence_results(this);
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
      <div style={{"text-align": "center", "font-size": "30px"}}>
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
    session: state.session_sequence,
  };
}

const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(SequencePayment);

