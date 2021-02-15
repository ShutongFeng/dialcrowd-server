import React from "react";
import { Button, Drawer, Row, Tabs } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown';

const TabPane = Tabs.TabPane;

class HelpQuality extends React.Component {
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
    return (
      <div>
        <Button type="primary" style={{ float: "right", "marginLeft": "10px" }} onClick={this.showDrawer}>
          <QuestionCircleOutlined />Help
          </Button>
        <br></br>
        <br></br>
        <Drawer
          title="Category Classification"
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
                  <p>This tab is used for intent classification. During the task, the worker
                  will be asked to choose an intent for the given dialog. You can
                  click "New Project" to create a project. If it is successfully
                  created, you will see your project in the table. Then, click
                  the enter (edit) icon to start. We have provided an example that you
                      can follow.</p>
                </TabPane>
                <TabPane tab={<span>Create</span>} key="create">
                  <ReactMarkdown source={
                    "## 1) Basic Information \n" +
                    "In order to setup the category classification, requesters fill out the background, generic insturctions, and number of sentences shown to each worker \n" +
                    "\n" +
                    "## 2) Upload your data\n" +
                    "Format of Category Classification\n" +
                    "The format of category classification is just sentences split by newline (\\n)\n" +
                    "```\n" +
                    "Has onihime vs been made into an anime\n" +
                    "What percent of 25 is 23\n" +
                    "What does C K mean\n" +
                    "How do you say eggs with bacon and toast in spanish\n" +
                    "Is cat litter safe for concrete to melt ice\n" +
                    "U-235 and Pu-239 are both what\n" +
                    "Did Hannibal Lecter kill Allegra Pazzi\n" +
                    "```\n" +
                    "\n" +
                    "## 3) Add Class\n" +
                    "You need to define class categories (e.g., inform, request, confirm, etc) and example sentences for workers.  \n" +
                    "These exmaples will be shown in DialCrowd Workers. \n" +
                    "\n" +
                    "## 4) Save your project\n" +
                    "## 5) Test and deploy\n" +
                    "You can download the format for uploading your data. You can preview the DialCrowd Worker's website. \n"
                  } />
                  <br></br>
                  <br></br>
                </TabPane>
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




export default HelpQuality;