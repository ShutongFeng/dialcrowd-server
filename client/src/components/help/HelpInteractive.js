import React from "react";
import { Button, Drawer, Row, Tabs } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'

import ReactMarkdown from 'react-markdown';

const TabPane = Tabs.TabPane;

// TODO add user goal in the help page

class HelpInteractive extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState(
      {
        visible: false,
      }
    );
  };

  componentDidMount() {
  }


  render() {
    console.log("HELP", this.state)
    return (
      <div>
        <Button type="primary" style={{ float: "right", "marginLeft": "10px" }} onClick={this.showDrawer}>
          <QuestionCircleOutlined />Help
          </Button>
        <br></br>
        <br></br>
        <Drawer
          title="Interactive Tests"
          width={720}
          placement="right"
          onClose={this.onClose}
          maskClosable={true}
          visible={this.state.visible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          <Row gutter={16}>
            <div>
              <Tabs defaultActiveKey="intro">
                <TabPane tab={<span>Introduction</span>} key="intro">
                  <p>Here, you can create an interactive experience for the worker to directly speak to your dialog system.
                  After the conversation, you can present the worker with a survey about their experience, for example,
                  on a Likert scale. In addition, you can create an A/B test where the worker speaks with two dialog
                  systems and can rate on the survey which system they preferred based on your specifications. You can
                  click the "New Project" button to create a new project. If it us successfully created, you will
                  see your project in the table. Please click the enter (edit) icon to start. We will provide an
                  example for you to follow.
                    </p>
                </TabPane>
                <TabPane tab={<span>Create</span>} key="create">
                  <ReactMarkdown source={
                    "### 1) Project setting \n" +
                    "After creating a project, you need to design the experiment in detail, including a generic introduction, specific instructions, and exit polls. The exit polls can be one of three types: Likert scale, open-ended, and A/B testing which are presented in random order to the worker. DialCrowd allows you to either evaluate one system or more than one system in an A/B test by adding the systems during task creation. These will be shown to the worker also in random order. For non-interactive testing, JSON data, such as dialog logs, need to be added.\n" +
                    "\n" +
                    "\n" +
                    "### 2) Connect your spoken dialog systems\n" +
                    "If you have not already done so, connect your dialog system in the \"Add System\" tab. After you have done so, input the name of the dialog system into the \"Agent\" slot during the system add. Create a name for the dialog system that will be shown to the worker in the \"Name of Dialog System\" slot. Add any specific instructions or questions for the worker in the following slots. \n" +
                    "### 3) Testing and Deploying\n" +
                    "After running the backend RESTful APIs, please input the backend API URL and check the connection in DialCrowd. If you have successfully connected to your dialog systems to DialCrowd you can preview the website that DialCrowd has automatically generated."} />
                </TabPane>
                <br></br>
                <br></br>
              </Tabs>
            </div>
          </Row>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.onClose}
            >
              Close
              </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}




export default HelpInteractive;