import React from 'react';
import {connect} from 'react-redux';
import {Icon, Tabs} from 'antd';
import CategoryConfigure from "./CategoryConfigure.js";
import CategoryResult from "./CategoryResult.js";
import CategoryQuality from "./CategoryQuality.js";
import CategoryPayment from "./CategoryPayment.js";
import CategoryFeedback from "./CategoryFeedback.js";

const TabPane = Tabs.TabPane;

class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("Category open")
  }

  render() {
    return <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><Icon type="home"/>Configure</span>} key="1">
          {this.props.session.hasOwnProperty('classLabel') ?
              <CategoryConfigure data={this.props.session}/>
              : null}
        </TabPane>
        <TabPane tab={<span><Icon type="area-chart"/>Raw Results</span>} key="2">
          <CategoryResult data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="message"/>Feedback</span>} key="5">
          <CategoryFeedback data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="bar-chart"/>Quality</span>} key="3">
          <CategoryQuality data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="pay-circle-o"/>Payment</span>} key="4">
          <CategoryPayment data={this.props.session}/>
        </TabPane>
        {/*
        <TabPane tab={<span><Icon type="home"/>Make Golden Answers</span>} key="3">
          <Iframe style={{"margin-right": "10px"}} url={clientUrl + "/worker_category?MID=golden&ID=" + this.props.session._id}
                  width="100%"
                  height="1000px"
                  display="initial"
                  position="relative"
                  allowFullScreen/>
        </TabPane>
        */}
      </Tabs>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    session: state.session_category,
  }
}


const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Category);
