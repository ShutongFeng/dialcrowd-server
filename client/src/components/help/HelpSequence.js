import React from "react";
import { Button, Drawer, Row, Tabs } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'

import ReactMarkdown from 'react-markdown';

const TabPane = Tabs.TabPane;

class HelpSequence extends React.Component {
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
          title="Sequence Labeling"
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
                  The goal of this crowdsourcing feature is to categorize different types of
                  entities. After entering the sequence labeing task, the worker will be asked
                  to select specific words or a phrase in a sentence. Then, they will choose
                  the corresponding type of entity that that phrase can be categorized into
                  using the buttons below the sentence. If the worker is not sure which type of
                  entity it belongs to, they will choose "other". You can click on the "New Project"
                  button to create a new project with a name and password.  Once it is successfully
                  created, you will see the new project in a table. Then, please click the enter (edit)
                  icon to start, and we have provided a guide that you can follow.
                  </TabPane>
                <TabPane tab={<span>Create</span>} key="create">
                  <ReactMarkdown source={
                    "## 1) Basic information \n" +
                    "In order to setup a new sequence labeling project, requesters need to fill out the background and generic instructions. \n" +
                    "## (2) Upload your data\n" +
                    "The data can be uploaded by uploading a .txt file that contains the sentences for the workers to analyze using sequence labeling. Separate the sentences with a newline in the txt file. \n" +
                    "## (3) Add Type of Entities\n" +
                    "By clicking the \"Add One More Category\" button, the requester can add an entity type that workers will be able to select.\n" +
                    "The requester will need to specify both the type and an example of the entity during creation.\n" +
                    "## (4) Save your Project\n" +
                    "## (5) Test and Deploy\n" +
                    "You can preview your project with the \"Preview\" button to see what the workers will.\n" +
                    "After finishing the sequence labeling, workers will receive a code for the payment.\n"} />
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




export default HelpSequence;