import React from 'react';
import {connect} from 'react-redux';
import {Icon, Tabs} from 'antd';
import QualityConfigure from "./QualityConfigure.js";
import QualityResult from "./QualityResult.js";
import QualityQuality from "./QualityQuality.js";
import QualityPayment from "./QualityPayment.js";
import QualityFeedback from "./QualityFeedback.js";

const TabPane = Tabs.TabPane;

class Quality extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("Quality open")
  }

  render() {
    return <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><Icon type="home"/>Configure</span>} key="1">
          <QualityConfigure data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="area-chart"/>Raw Results</span>} key="2">
          <QualityResult data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="message"/>Feedback</span>} key="5">
          <QualityFeedback data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="bar-chart"/>Quality</span>} key="3">
          <QualityQuality data={this.props.session}/>
        </TabPane>
        <TabPane tab={<span><Icon type="pay-circle-o"/>Payment</span>} key="4">
          <QualityPayment data={this.props.session}/>
        </TabPane>
      </Tabs>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    session: state.session_quality,
  }
}


const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Quality);
