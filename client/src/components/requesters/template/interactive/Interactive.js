import React from 'react';
import {connect} from 'react-redux'
import {Icon, Tabs} from 'antd';

import InteractiveConfigure from "./InteractiveConfigure.js";
import Results from "./Results.js";
import {newInteractive} from "../../../../actions/interactiveActions";
import InteractiveQuality from "./InteractiveQuality";
import InteractivePayment from "./InteractivePayment";
import InteractiveFeedback from "./InteractiveFeedback";

const TabPane = Tabs.TabPane;


class Interactive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("interactive open");
  }

  render() {
    return <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><Icon type="home"/>Configure</span>} key="1">
          {this.props.interactive !== "text" ?
              <InteractiveConfigure session={this.props.interactive}/>
              : null
          }
        </TabPane>
        <TabPane tab={<span><Icon type="area-chart"/>Raw Results</span>} key="2">
          <Results session={this.props.interactive}/>
        </TabPane>
        <TabPane tab={<span><Icon type="message"/>Feedback</span>} key="5">
          <InteractiveFeedback session={this.props.interactive}/>
        </TabPane>
        <TabPane tab={<span><Icon type="bar-chart"/>Quality</span>} key="3">
          <InteractiveQuality session={this.props.interactive}/>
        </TabPane>
        <TabPane tab={<span><Icon type="pay-circle-o"/>Payment</span>} key="4">
          <InteractivePayment session={this.props.interactive}/>
        </TabPane>
      </Tabs>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    interactive: state.session_interactive,
  }
}


const mapDispatchToProps = {
  newInteractive: newInteractive,
};

export default connect(mapStateToProps, mapDispatchToProps)(Interactive);
