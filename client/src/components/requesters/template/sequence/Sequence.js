import React from 'react';
import { connect } from 'react-redux'
import { Tabs } from 'antd';
import { HomeOutlined, AreaChartOutlined, MessageOutlined, BarChartOutlined, PayCircleOutlined } from '@ant-design/icons'


import SequenceConfigure from "./SequenceConfigure.js";
import SequenceResult from "./SequenceResult.js";
import SequenceQuality from "./SequenceQuality.js";
import SequencePayment from "./SequencePayment.js";
import SequenceFeedback from "./SequenceFeedback.js";

const TabPane = Tabs.TabPane;


class Sequence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("Sequence open")
  }

  render() {
    return <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><HomeOutlined />Configure</span>} key="1">
          {this.props.session.hasOwnProperty('Label') ?
            <SequenceConfigure data={this.props.session} />
            : null}
        </TabPane>
        <TabPane tab={<span><AreaChartOutlined />Raw Results</span>} key="2">
          <SequenceResult data={this.props.session} />
        </TabPane>
        <TabPane tab={<span><MessageOutlined />Feedback</span>} key="5">
          <SequenceFeedback data={this.props.session} />
        </TabPane>
        <TabPane tab={<span><BarChartOutlined />Quality</span>} key="3">
          <SequenceQuality data={this.props.session} />
        </TabPane>
        <TabPane tab={<span><PayCircleOutlined />Payment</span>} key="4">
          <SequencePayment data={this.props.session} />
        </TabPane>
      </Tabs>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    session: state.session_sequence,
  }
}


const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Sequence);
