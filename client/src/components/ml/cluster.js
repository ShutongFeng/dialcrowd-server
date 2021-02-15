import React from 'react';
import { connect } from 'react-redux'
import { Button, Checkbox, Collapse, Form, Input, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const FormItem = Form.Item;

let uuid = 0;

function Submit(t, data) {
  console.log(data);
  let sent = data["sents"];
  let clusters = {};
  sent.forEach((x, i) => {
    clusters[i] = []
    sent[i].split("\n").forEach(y => {
      clusters[i].push(y);
    })
  })
  let unlabeled = data["unlabeled"].split("\n");

  fetch('http://128.2.211.58:4455/v1/cluster', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'authorization': 'api_key'
    },
    body: JSON.stringify({ 'clusters': clusters, 'unlabeled': unlabeled, 'model': 'inferSent' })
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      console.log(json);
      t.setState({
        result: json
      })
    });
}


class Cluster extends React.Component {
  remove = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }
  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Submit(this, values);
        console.log('Received values of form: ', values);
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = { result: {} };
  }

  componentDidMount() {
    console.log("intractive open");
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
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
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (
        <FormItem
          {...(formItemLayout)}
          label={'Cluster ' + index.toString()}
          required={false}
          key={k}
        >
          {getFieldDecorator(`sents[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: "Please input sentences",
            }],
          })(
            <Input.TextArea placeholder="Input sentences" style={{ width: '80%', marginRight: 8 }}
              autosize={{ minRows: 4, maxRows: 10 }} />
          )}
          {keys.length > 1 ? (
            <MinusCircleOutlined
              className="dynamic-delete-button"
              disabled={keys.length === 1}
              onClick={() => this.remove(k)}
            />
          ) : null}
        </FormItem>
      );
    });

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout}
            label={"Unlabeled Data"}>
            {getFieldDecorator(`unlabeled`, {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [{
                required: true,
                whitespace: true,
                message: "Please input sentences",
              }],
            })(
              <Input.TextArea placeholder={"Input sentences"} style={{ width: '80%', marginRight: 8 }}
                autosize={{ minRows: 4, maxRows: 10 }} />
            )}
          </FormItem>
          {formItems}
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={this.add} style={{ width: '80%' }}>
              <PlusOutlined />Add field
              </Button>
          </FormItem>
          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="primary" htmlType="submit">Clustering</Button>
          </FormItem>
        </Form>
        {Object.keys(this.state.result).length > 0 ?
          <Collapse>
            {Object.keys(this.state.result).map((x, i) =>
              <Collapse.Panel header={"cluster " + x} key={i}>
                {this.state.result[x].map(s =>
                  <div>
                    <Tag color="orange">{(Math.round(s["score"] * 100) / 100)}</Tag>
                    <Checkbox>{s["sent"]}</Checkbox>
                  </div>
                )}
              </Collapse.Panel>
            )}
          </Collapse> : null}
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    session: state.session_category,
  }
}


const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Cluster));
