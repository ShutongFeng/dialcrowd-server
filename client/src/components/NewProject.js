import React from "react";
import { Button, Form, Input, Modal, Tooltip, } from 'antd'
import { FolderAddOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { serverUrl } from "../configs";
import { message } from "antd/lib/index";
import { new_project_data } from "../actions/crowdAction";
import { connect } from "react-redux";

const FormItem = Form.Item;


function Submit(t, data, id) {
  fetch(serverUrl + '/api/save/task/' + t.props.project + '/' + id, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.message === "success") {
        message.success("Success");
        t.props.new_project_data(t.props.project);
      }
      else {
        message.success("Fail");
      }
    });
}


class NewProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: "",
      visible: false,
      utterance: '',
      intent: null,
      user_id: "",
      files: [],
      confirmDirty: false,
      entities: []
    }
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  cancelModal = () => {

    this.setState({
      visible: false,
    });
  }

  hideModal = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        Submit(this, values, "new");
        this.props.form.resetFields();
      }

    });


    this.setState({
      visible: false,
    });
    //console.log("File:: " + this.props.filename);

  }


  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {

        console.log('Received values of form: ', values);
      }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };

    return (
      <div>
        <Button
          onClick={this.showModal}>
          <FolderAddOutlined /> New Project
          </Button>
        <Modal
          title="New Project"
          visible={this.state.visible}
          onOk={this.hideModal}
          onCancel={this.cancelModal}
          okText="New Project"
          cancelText="Cancel"
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  Project name&nbsp;
                  <Tooltip title="Please input the project. ">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              )}
              hasFeedback
            >
              {getFieldDecorator('project', {
                rules: [{ required: true, message: 'Please input the project!', whitespace: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  Creator&nbsp;
                  <Tooltip title="You can find your project by your creator name">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              )}
            >
              {getFieldDecorator('nickname', {
                rules: [{ required: true, message: 'Please input your creator name!', whitespace: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Password"
            >
              {getFieldDecorator('password', {
                rules: [{
                  required: true, message: 'Please input your password!',
                }, {
                  validator: this.checkConfirm,
                }],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Confirm Password"
            >
              {getFieldDecorator('confirm', {
                rules: [{
                  required: true, message: 'Please confirm your password!',
                }, {
                  validator: this.checkPassword,
                }],
              })(
                <Input type="password" onBlur={this.handleConfirmBlur} />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {}
}


const mapDispatchToProps = {
  new_project_data: new_project_data,

};


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(NewProject))


