import React from "react";
import { Form, Input, Select, Tooltip, Button } from 'antd'
import { QuestionCircleOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import QuestionList from "./QuestionList.js"


function lists2Systems(names, instructions, queries, types,
  exampless, counterexampless) {
  const _addKey = (xs) => (
    xs.filter((x) => (x !== null))
      .map((x, i) => ({ key: i, content: x }))
  );
  let systems = [];
  for (let i = 0; i < names.length; i += 1) {
    // Workaround: in case exampless[i] is not an array.
    let examples = Array.isArray(exampless[i]) ? exampless[i] : [exampless[i]];
    let counterexamples = (
      Array.isArray(exampless[i]) ? counterexampless[i] : [counterexampless[i]]
    );

    systems.push({
      "key": i,
      "name": names[i],
      "instruction": instructions[i],
      "questions": [
        {
          key: 0,
          title: queries[i],
          type: types[i],
          examples: _addKey(examples),
          counterexamples: _addKey(counterexamples)
        }
      ]
    });
  }
  return systems;
}


class System extends React.Component {
  /* Props:
   * @{object}	form:
   * @{style}	formItemLayout:
   * @{function} removeByKey: Function that can remove a element by id.
   * @{function} addByKey: Function that can remove a element by id.
   * @{function} updateByKey: Function that can update a element by id.
   * @{string}	fieldNameSystem: HTML form name for the field of the system.
   * @{string}	helpText: Help text to shown when hovering over the question mark.
   * @{Array}	systems: Check `this.newSystem` for the structure of the element.
   * @{Array}	agents: Available agents to choose from.
   */
  constructor(props) {
    super(props);
  }

  render() {
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

    return (
      <>
        <div>
          {
            this.props.systems.map(
              (system) => (this._showSystem(system))
            )
          }
        </div>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.addSystem} style={{ width: '90%' }}>
            <PlusOutlined /> Add System
          </Button>
        </Form.Item>
      </>
    );
  }

  addSystem = () => {
    this.props.addByKey([this.props.fieldNameSystem], this.constructor.newSystem());
  }

  static newSystem() {
    /* Factory a new empty initialized system object. */
    return {
      name: "",
      agent: "",
      instruction: "",
      questions: [
        { key: 0, ...QuestionList.newQuestion() }
      ]
    };
  }

  _showSystem(system) {
    const { formItemLayout, fieldNameSystem } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div key={system.key}
        style={{ border: "2px solid black", margin: "10px", padding: 24, display: "block" }}
      >

        {/* instruction tooltip that show instruction when mouse hovering over it. */}
        <span style={{
          float: "left",
          "margin-bottom": "-30px"
        }}
          class="instruction-tooltip">
          <Tooltip
            title={this.props.textInstruction}>
            <QuestionCircleOutlined /> &nbsp; Tips
          </Tooltip>
        </span>

        {/* Removal Button */}
        <Form.Item>
          <span style={{ float: "right", "margin-bottom": "-30px", "margin-top": "-20px", "margin-right": "-10px" }}>
            {this.props.systems.length > 1 ? (
              <MinusCircleOutlined
                className="dynamic-delete-button"
                disabled={this.props.systems.length === 1}
                onClick={() => this.props.removeByKey([fieldNameSystem, system.key])}
              />
            ) : null}
          </span>
        </Form.Item>

        {/* System name. */}
        <Form.Item
          {...formItemLayout}
          label={(
            <span>
              System Display Name &nbsp;
              <Tooltip
                title={(
                  "Please write the name of your dialog system. DO NOT write "
                  + "'Baseline' or 'Proposed System'.  This name will be shown "
                  + "to workers (e.g., System A)"
                )}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
          required={true}
        >
          {getFieldDecorator(`${fieldNameSystem}[${system.key}][name]`, {
            initialValue: system.name,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: "Please input the name of the dialog system to show to workers.",
            }],
          })(
            <Input placeholder="System A" style={{ width: '90%', marginRight: 8 }} />
          )}
        </Form.Item>

        {/* Agent */}
        <Form.Item
          {...formItemLayout}
          label="Agent"
          hasFeedback
        >
          {getFieldDecorator(`${fieldNameSystem}[${system.key}][agent]`, {
            initialValue: system.agent,
            rules: [
              { required: true, message: 'Please select an agent!' },
            ],
          })(
            <Select placeholder="Please choose your system">
              {this.props.agents.map((x, l) =>
                <Select.Option key={l} value={x._id}> {x.name} </Select.Option>
              )}
            </Select>
          )}
        </Form.Item>

        {/* Instruction */}
        <Form.Item
          {...(formItemLayout)}
          label={(
            <span>
              Specific Instructions&nbsp;
              <Tooltip
                title={(
                  "Please note any instructions for interacting with the system "
                  + "(e.g., 'please interact with the system for more "
                  + "than 10 turns', 'please ask about the weather tomorrow in Pittsburgh', etc)"
                )}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
          required={false}
        >
          {getFieldDecorator(`${fieldNameSystem}[${system.key}][instruction]`, {
            initialValue: system.instruction,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: "Please write specific instructions",
            }],
          })(
            <Input placeholder="Please talk about weather and more than 10 turns! "
              style={{ width: '90%', marginRight: 8 }} />
          )}
        </Form.Item>
        <QuestionList
          form={this.props.form}
          formItemLayout={formItemLayout}
          removeByKey={this.props.removeByKey}
          addByKey={this.props.addByKey}
          updateByKey={this.props.updateByKey}
          questions={system.questions}
          rootKey={[fieldNameSystem, system.key, "questions"]}
          questionFieldLabel="Question"
          questionHelpText={(
            "Ask questions about this system. For example, you can ask the worker "
            + "to assess the quality of this system here."
          )}
          textAddQuestion="Add a System Specific Question"
          textInstruction={this.props.helpText}
          placeholderQuestion="Do you think it was a good system?"
          placeholderExample="Yes, it was always on topic."
          placeholderCounterexample="I want to get paid more."
          placeholderOption="Input your option here."
          listStyle="divider"
        />
      </div>
    );
  }
}


export default System;
export { lists2Systems };

