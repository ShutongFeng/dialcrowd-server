import React from "react";
import {Icon, Tabs} from 'antd';

import GeneralTaskWalkthrough from "./GeneralTaskWalkthrough.js"
import AddSystemWalkthrough from "./AddSystemWalkthrough.js"
import InteractiveWalkthrough from "./InteractiveWalkthrough.js"
import QualityWalkthrough from "./QualityWalkthrough.js"

const TabPane = Tabs.TabPane;

class Walkthrough extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
        return <div>
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><Icon type="container"/>Generic Task</span>} key="1">
              <GeneralTaskWalkthrough/>
          </TabPane>
          <TabPane tab={<span><Icon type="plus-circle"/>Add System</span>} key="2">
            <AddSystemWalkthrough/>
          </TabPane>
          <TabPane tab={<span><Icon type="message"/>Interactive Task</span>} key="5">
            <InteractiveWalkthrough/>
          </TabPane>
          <TabPane tab={<span><Icon type="safety"/>Quality Tab</span>} key="3">
            <QualityWalkthrough/>
          </TabPane>
        </Tabs>
      </div>
    }
  }
  
  
  export default Walkthrough  