import React from "react";
import { Button, Col, Drawer, Form, Input, Row, Select, Tooltip } from 'antd'
import { QuestionCircleOutlined } from "@ant-design/icons"

const { Option } = Select;

class NewSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };


  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  componentDidMount() {
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Drawer
          title="Create"
          width={720}
          placement="right"
          onClose={this.props.onClose}
          maskClosable={true}
          visible={this.props.visible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="System Name">
                  {getFieldDecorator('name', {
                    initialValue: this.props.data.name,
                    rules: [{ required: true, message: 'please enter user name' }],
                  })(<Input placeholder="please enter user name" />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Url">
                  {getFieldDecorator('url', {
                    initialValue: this.props.data.url,
                    rules: [{ required: true, message: 'please enter url' }],
                  })(
                    <Input
                      style={{ width: '100%' }}
                      addonBefore="http://"
                      placeholder="please enter url"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="User">
                  {getFieldDecorator('user', {
                    initialValue: this.props.data.user,
                    rules: [{ required: true, message: 'Please select an owner' }],
                  })(
                    <Input
                      style={{ width: '100%' }}
                      placeholder="please enter user name"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={(
                  <span>
                    Type&nbsp;
                    <Tooltip title="Only public systems will be able to be selected for Interaction tasks.">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                )}>
                  {getFieldDecorator('type', {
                    initialValue: this.props.data.type,
                    rules: [{ required: true, message: 'Please choose the type' }],
                  })(
                    <Select placeholder="Please choose the type">
                      <Option value="private">Private</Option>
                      <Option value="public">Public</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Organization">
                  {getFieldDecorator('org', {
                    initialValue: this.props.data.org,
                    rules: [{ required: true, message: 'Please choose the organization' }],
                  })(
                    <Input
                      style={{ width: '100%' }}
                      placeholder="please enter your organization"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Github page">
                  {getFieldDecorator('github', {
                    initialValue: this.props.data.github,
                    rules: [{ required: true, message: 'Please enter the github' }],
                  })(
                    <Input
                      style={{ width: '100%' }}
                      placeholder="http://github.com/<organization_id>"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Description">
                  {getFieldDecorator('desc', {
                    initialValue: this.props.data.desc,
                    rules: [
                      {
                        required: true,
                        message: 'please enter url description',
                      },
                    ],
                  })(<Input.TextArea rows={4} placeholder="please enter description" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                >
                  {getFieldDecorator('password', {
                    rules: [{
                      required: true, message: 'Please input your password!',
                    }, {
                      validator: this.validateToNextPassword,
                    }],
                  })(
                    <Input type="password" />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Confirm Password"
                >
                  {getFieldDecorator('confirm', {
                    rules: [{
                      required: true, message: 'Please confirm your password!',
                    }, {
                      validator: this.compareToFirstPassword,
                    }],
                  })(
                    <Input type="password" onBlur={this.handleConfirmBlur} />
                  )}
                </Form.Item>
              </Col>
            </Row>

          </Form>
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
              onClick={this.props.onClose}
            >
              Close
              </Button>
            <Button onClick={this.props.submit} type="primary">Submit</Button>
          </div>
        </Drawer>
      </div>
    );
  }
}


export default NewSystem;
