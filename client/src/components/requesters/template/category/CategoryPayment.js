import React, {Component} from 'react'
import {connect} from "react-redux";
import {Table} from 'antd';

import {new_project_data} from "../../../../actions/crowdAction";
import {loadData} from "../../../../actions/sessionActions";
import {serverUrl} from "../../../../configs";

function getDetail(t) {
  const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
  fetch(serverUrl + '/api/get/detail_result/category/' + t.props.session._id)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        let bonuses = []
        let avg = []
        let cost = 0

        if (json["response"].length > 0){
          json["response"].forEach(x => {
            avg.push(x["total_duration"]);
          });
  
          let average_time = average(avg)
  
          json["response"].forEach(x =>{
            if (x["total_duration"] > average_time){
              bonuses.push({"submissionID": x["userId"], "bonus": "$" + Number(Math.round(15 * (x["total_duration"] - average_time) / 3600+'e2') + 'e-2').toString()})
            }
            else{
              bonuses.push({"submissionID": x["userId"], "bonus": "$0.00"})
            }
          })

          cost = 15 * average_time / 3600
        }

        t.setState({
          cost: cost,
          bonus: bonuses
        });

      });
}

class CategoryPayment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feedback: []
    }
  }

  componentDidMount() {
    getDetail(this);
  }

  render() {
    getDetail(this);

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
      <br></br>
      <br></br>
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
    session: state.session_category,
  };
}

const mapDispatchToProps = {
  loadData: loadData,
  new_project_data: new_project_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPayment);

