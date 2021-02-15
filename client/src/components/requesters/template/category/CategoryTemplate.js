import React from "react";
import { Button, Drawer, Form, Input, Row, Tabs } from 'antd';
import { EditOutlined } from '@ant-design/icons'
import { clientUrl } from '../../../../configs'


const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

class CategoryTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, username: '', showlink: false };
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

  generate = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          username: values.username,
          showlink: true
        })
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (
      <div>
        <Button type="primary" style={{ float: "left", width: "90%" }} onClick={this.showDrawer}>
          <EditOutlined />Amazon Mechanical Turk Template
          </Button>
        <br></br>
        <br></br>
        <Drawer
          title="Template"
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
              <Tabs defaultActiveKey="preview">
                <TabPane tab={<span>Preview</span>} key="preview">
                  <div>
                    <div style={{ "border-style": "solid" }}>
                      <div style={{ "text-align": "center" }}>
                        <p>Preview</p>
                      </div>
                      <p style={{ "padding-left": "2%" }}>Background: {this.props.thisstate.generic_introduction} </p>
                      <p style={{ "padding-left": "2%" }}>Instructions: {this.props.thisstate.generic_instructions} </p>
                    </div>
                    <br></br>
                    <p>Input a username and generate the HIT link</p>

                    <Form onSubmit={this.generate}>
                      <FormItem {...formItemLayout}>
                        {getFieldDecorator(`username`)(
                          <Input.TextArea placeholder={"Username"} style={{ width: '60%', marginRight: 8, float: "left" }}
                            autoSize={{ minRows: 1, maxRows: 1 }} />
                        )}
                        <Button type="primary" htmlType="submit" style={{ float: "left" }}>Generate Link</Button>
                      </FormItem>
                    </Form>

                    {this.state.showlink ?
                      <p>Please go to {clientUrl}/worker_category?MID={this.state.username}ID={this.props.thisstate._id} in a separate window to complete the HIT</p>
                      : null}

                    <br></br>
                    <p>When you are done, input the confirmation code here: <input type="text" style={{ "border": "1px solid gray", "padding-left": "5px" }} /></p>
                  </div>
                </TabPane>
                <TabPane tab={<span>Code</span>} key="code">
                  <pre>
                    <code>
                      &lt;style&gt;<br></br>
                      <p style={{ "margin-left": "20px" }}>table, th, td {"{"}</p>
                      <p style={{ "margin-left": "40px" }}>border: 1px solid black;</p>
                      <p style={{ "margin-left": "20px" }}>{"}"}</p>
                      <p style={{ "margin-left": "20px" }}>th, td {"{"}</p>
                      <p style={{ "margin-left": "40px" }}>padding: 15px;</p>
                      <p style={{ "margin-left": "20px" }}>{"}"}</p>
                            &lt;/style&gt;<br></br>
                      <br></br>
                            &lt;!-- Unique turker script --&gt; <br></br>
                            &lt;script src="//uniqueturker.myleott.com/lib.js" type="text/javascript"&gt;&lt;/script&gt;<br></br>
                            &lt;script&gt;<br></br>
                            (function() {"{"}
                      <p style={{ "margin-left": "20px" }}>var ut_id = "e776c2408d15bc01e2f380e30759f24b";<br></br>
                                                                    if (UTWorkerLimitReached(ut_id)) {"{"}</p>
                      <p style={{ "margin-left": "40px" }}>document.getElementById('mturk_form').style.display = 'none';<br></br>
                                                                        document.getElementsByTagName('body')[0].innerHTML = "You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.";</p>
                      <p style={{ "margin-left": "20px" }}>{"}"}</p>
                      {"}"});<br></br>
                            &lt;/script&gt;<br></br>
                      <br></br>
                            &lt;!-- You must include this Javascript file --&gt; <br></br>
                            &lt;script src="https://assets.crowd.aws/crowd-html-elements.js"&gt;&lt;/script&gt; <br></br>
                      <br></br>
                            &lt;!-- For the full list of available Crowd HTML Elements and their input/output documentation, please refer to https://docs.aws.amazon.com/sagemaker/latest/dg/sms-ui-template-reference.html --&gt; <br></br>
                      <br></br>
                            &lt;!-- You must include crowd-form so that your task submits answers to MTurk --&gt; <br></br>
                            &lt;crowd-form answer-format="flatten-objects"&gt; <br></br>
                      <br></br>
                            &lt;div&gt; <br></br>
                      <p style={{ "margin-left": "20px" }}>&lt;div style="border-style: solid"&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;div style="text-align: center"&gt;</p>
                      <p style={{ "margin-left": "60px" }}>&lt;p&gt;Preview&lt;/p&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;/div&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;p style="padding-left: 2%"&gt;Background: {this.props.thisstate.generic_introduction} &lt;/p&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;p style="padding-left: 2%"&gt;Instructions: {this.props.thisstate.generic_instructions} &lt;/p&gt;</p>
                      <p style={{ "margin-left": "20px" }}>&lt;/div&gt;</p>
                      <p style={{ "margin-left": "20px" }}>&lt;div&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;p&gt;Input a username and generate the HIT link&lt;/p&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;input id="workerid" type="text" name="username" placeholder="Username"&gt;</p>
                      <p style={{ "margin-left": "40px" }}>&lt;button id="submit"&gt;Generate Link&lt;/button&gt;</p>
                      <p style={{ "margin-left": "20px" }}>&lt;/div&gt;</p>
                      <p style={{ "margin-left": "20px" }}>&lt;br&gt;</p>
                      <p style={{ "margin-left": "20px" }}>&lt;div&gt;&lt;span id="dialcrowd_link"&gt; - &lt;/span&gt;&lt;/div&gt;</p>

                      <p style={{ "margin-left": "20px" }}>&lt;script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"&gt;&lt;/script&gt;</p>
                      <p style={{ "margin-left": "20px" }}>&lt;script&gt;</p>
                      <p style={{ "margin-left": "40px" }}>document.getElementById('submit').onclick = function(event) {"{"}</p>
                      <p style={{ "margin-left": "60px" }}>event.preventDefault();</p>
                      <p style={{ "margin-left": "60px" }}>document.getElementById("dialcrowd_link").textContent = "Please go to {clientUrl}/worker_category/?ID=5f0b6fe49878971ce8ab83c9&MID=" + document.getElementById("workerid").value + " in a separate window to complete the HIT"</p>
                      <p style={{ "margin-left": "40px" }}>{"}"}</p>
                      <p style={{ "margin-left": "20px" }}>&lt;/script&gt;</p>

                      <p style={{ "margin-left": "20px" }}>&lt;p&gt;When you are done, input the confirmation code here: &lt;input type="text" name="confirmation_code"&gt;&lt;/p&gt;</p>
                            &lt;/div&gt; <br></br>
                            &lt;/crowd-form&gt; <br></br>
                    </code>
                  </pre>
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




export default Form.create()(CategoryTemplate);
