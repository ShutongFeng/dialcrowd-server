import React from "react";
import { Button, Drawer, Input, Row, Tooltip } from 'antd';
import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form } from "antd/lib/index";

const FormItem = Form.Item;

class RejectionTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, final: false, reason: "" };
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

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("values", values);
        this.setState({
          final: true,
          reason: values["instruction"]
        })
      }
      else {
        console.log(err);

      }
    });
  }

  return = (e) => {
    this.setState({
      final: false,
      reason: ""
    })
  }

  componentDidMount() {
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const reason = this.state.reason;
    return (
      <div>
        <Button type="primary" style={{ float: "left" }} onClick={this.showDrawer}>
          <EditOutlined />Template
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
              {!this.state.final ? <Form onSubmit={this.handleSubmit}>
                <FormItem
                  {...(formItemLayout)}
                  label={(
                    <span>
                      Reason&nbsp;
                      <Tooltip title="Please write the specific instruction stated that the worker did not follow, or the specific evaluation metric stated that was failed">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  )}
                  required={true}
                >
                  {getFieldDecorator('instruction', {
                    validateTrigger: ['onChange', 'onBlur'],
                  })(
                    <Input placeholder="specific instruction not followed/specific metric not passed" style={{ width: '90%', marginRight: 8 }} />
                  )}
                </FormItem>
                <Button type="primary" htmlType="submit">Submit</Button>
              </Form> :
                <div>
                  <span> Dear Worker, <br></br>
                        Unfortunately, we have decided to reject your HIT for the following reason: <br></br>
                    {reason} <br></br>
                        Please reach out to us if you would like to redo the HIT after fixing this error.  Thank you.
                </span>
                  <br></br>
                  <br></br>
                  <Button type="primary" onClick={this.return}>Return</Button>
                </div>
              }
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




export default (Form.create()(RejectionTemplate));