import React from "react";
import { Button, Drawer, Row, Tabs } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const TabPane = Tabs.TabPane;

class HelpConnectSystem extends React.Component {
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
          title="How to create and connect a system"
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
                  <p>In order to connect to DialCrowd, a dialog system needs to have an HTTP server waiting for utterances
                  directed from DialCrowd through specific protocols. We have made connecting to DialCrowd extremely easy
                  for anyone with basic programming knowledge by providing them with off-the-shelf server wrapper templates
                  in three mainstream programming languages: Java, Python, and JavaScript. This HTTP API communication
                  protocol is the same as DialPort. Thus, if your dialog system is already used for evaluation in DialCrowd,
                    it is also ready for collection in DialPort. </p>
                  <p>Following the DialCrowd communication protocols, the Java, Python, and JavaScript server wrappers are
                  implemented with the Spark, Flask, and Node.js frameworks respectively. In this way, we completely hide
                  the implementation of RESTful APIs from the users. As a result, users only need to implement an HTTP API
                    server that supports three RESTful APIs: /init, /next, and /end.</p>
                </TabPane>
                <TabPane tab={<span>Create</span>} key="create">
                  <h4>Create A Remote Dialog System</h4>
                  <p>To start, you can download a <a href={"https://github.com/DialRC/PortalAPI/tree/master/PortalAPIforPythonFlask"} target={"_blank"}>dialog system skeleton </a>
                      in the language of your choice. There are three APIs you can edit:</p>
                  <p>1. Start a new session with your dialog system. If successful, the server will return a JSON containing
                        the sessionID.</p>
                  <p>URL</p>
                  <ReactMarkdown source={"```\n/init\n```"} />
                  <p>Method:</p>
                  <ReactMarkdown source={"```\n/POST\n```"} />
                  <p>Body Data</p>
                  <ReactMarkdown
                    source={"```json\n{\"sessionID\":\"USR_1234\", \"timeStamp\": \"yyyy-MM-dd'T'HH-mm-ss.SSS\" }\n```"} />
                  <p>Success Response (200)</p>
                  <ReactMarkdown source={"{\n" +
                    "  \"sessionID\": \"USR_1234\",\n" +
                    "  \"sys\": \"This word starts with A\",\n" +
                    "  \"version\": \"1.0-xxx\",\n" +
                    "  \"timeStamp\": \"yyyy-MM-dd'T'HH-mm-ss.SSS\",\n" +
                    "  \"terminal\": false\n" +
                    "}"} />

                  <p>2. For an ongoing session, the portal will use this API to obtain the next system response from your
                        dialog system.</p>
                  <p>URL</p>
                  <ReactMarkdown source={"```\n/next\n```"} />
                  <p>Method:</p>
                  <ReactMarkdown source={"```\n/POST\n```"} />
                  <p>Body Data</p>
                  <ReactMarkdown source={"```json\n{\n" +
                    "    \"sessionID\": \"USR_1234\",\n" +
                    "    \"text\": \"I guess the answer is APPLE\", \n" +
                    "    \"asrConf\": 0.9,\n" +
                    "    \"timeStamp\": \"yyyy-MM-dd'T'HH-mm-ss.SSS\"\n" +
                    "}\n```"} />
                  <p>Success Response (200)</p>
                  <ReactMarkdown source={"```json\n{\n" +
                    "  \"sessionID\": \"USR_1234\",\n" +
                    "  \"sys\": \"This word starts with A\",\n" +
                    "  \"version\": \"1.0-xxx\",\n" +
                    "  \"timeStamp\": \"yyyy-MM-dd'T'HH-mm-ss.SSS\",\n" +
                    "  \"terminal\": false\n" +
                    "}\n```"} />

                  <p>3. The portal sometimes (very rarely) wants to terminate an ongoing session with your dialog system
                        (e.g. due to a lost connection, conversation failure, etc.).</p>
                  <p>URL</p>
                  <ReactMarkdown source={"```\n/end\n```"} />
                  <p>Method:</p>
                  <ReactMarkdown source={"```\n/POST\n```"} />
                  <p>Body Data</p>
                  <ReactMarkdown source={"```json\n{\n" +
                    "    \"sessionID\": \"USR_1234\",\n" +
                    "    \"timeStamp\": \"yyyy-MM-dd'T'HH-mm-ss.SSS\"\n" +
                    "}\n```"} />
                  <p>Success Response (200)</p>
                  <ReactMarkdown source={"```json\n{\n" +
                    "  \"sessionID\": \"USR_1234\",\n" +
                    "  \"sys\": \"Goodbye\",\n" +
                    "  \"version\": \"1.0-xxx\",\n" +
                    "  \"timeStamp\": \"yyyy-MM-dd'T'HH-mm-ss.SSS\",\n" +
                    "  \"terminal\": true\n" +
                    "}\n```"} />
                  <br></br>
                  <br></br>
                </TabPane>
                <TabPane tab={<span>Connect</span>} key="connect">
                  <h4>Connect A Remote Dialog System</h4>
                  <p>The main piece of information you will need from your remote server is the URL
                  address for DialCrowd to send POST requests to. Fill out this information
                  when you are creating the dialog system connection on DialCrowd with the Create
                      button and you will be all set!</p>
                  <p>To test your system connection, you can click the speech bubble with three dots
                  in the right side of your system's entry in the table and proceed to chat with it
                      if the connection has been made.</p>
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


export default HelpConnectSystem;