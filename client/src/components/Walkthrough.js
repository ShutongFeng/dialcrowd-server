import React from "react";
import { Tabs } from 'antd';
import { ContainerOutlined, PlusCircleOutlined, MessageOutlined, SafetyOutlined } from '@ant-design/icons'

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
        <TabPane tab={<span><ContainerOutlined />Generic Task</span>} key="1">
          <GeneralTaskWalkthrough />
        </TabPane>
        <TabPane tab={<span><PlusCircleOutlined />Add System</span>} key="2">
          <AddSystemWalkthrough />
        </TabPane>
        <TabPane tab={<span><MessageOutlined />Interactive Task</span>} key="5">
          <InteractiveWalkthrough />
        </TabPane>
        <TabPane tab={<span><SafetyOutlined />Quality Tab</span>} key="3">
          <QualityWalkthrough />
        </TabPane>
      </Tabs>
    </div>
  }
}


export default Walkthrough  