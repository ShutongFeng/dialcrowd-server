import React, { Component } from 'react'
import { Button, Form, Input, message, Radio, Switch, Tooltip, InputNumber } from 'antd';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { clientUrl, serverUrl } from "../../../configs";
import FileReaderInput from 'react-file-reader-input';
import QuestionList, { lists2Questions, addKeys, DynamicItems } from "./QuestionList.js";
import PreviewButton from "./PreviewButton.js";
import { PreviewConsent } from "./Preview.js";
import { saveAs } from 'file-saver';
import ColorPicker from "./ColorPicker.js"
import FontPicker from "./FontPicker.js"

const FormItem = Form.Item;

let convoLength = 0

class Configure extends Component {
  // Text shown above the general question section, and when
  // hovering the question mark of general question section.
  static instructionSurvey = "";
  // Text shown when hovering the question mark of the questions
  // in general question section.
  static helpTextSurveyQuestion = "";
  constructor(props) {
    super(props);
    this.state = {
      url_dialog_system: [],
      generic_introduction: "",
      generic_instructions: "",
      name_of_dialog: [],
      speech: false,
      interface: "both",
      deploy: false,
      sys_index: 0,
      survey_index: 0,
      payment: "",
      time: "",
      consent: [], /* Content of the consent form. */
      requirements: [], /* Requirements user must fulfill. */
      questionSurveys: [], /* General questions. */
      questionFeedbacks: [], /* Feedback questions. */
      questionSystems: [], /* System specific questions. */
      loading: true,
      /* Indicate the loading state. It will be false after 
         data is copied from `this.makeProps` */
    }

    this.formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    this.formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

  }

  componentDidMount() {
    this.makeProps();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.session._id !== prevProps.session._id ||
      this.props.session.lastModifiedDate !== prevProps.session.lastModifiedDate
      // after submitting, `lastModifiedDate` will be change by backend.
    ) {
      this.makeProps();
    }

    // when config is loaded from a file.
    if (prevState.configRevision !== this.state.configRevision) {
      this.props.form.resetFields();
    }
  }

  makeProps() {
    /* This function copy and process data from `this.props.session`. */
    for (const prop of ["generic_instructions", "payment", "interface", "time",
      "consent", "url_dialog_system", "nUnit", "nAssignment",
      "generic_introduction", "requirements", "deploy",
      "hasFeedbackQuestion", "numofsent", "enableMarkdown"]) {
      this.setState({ [prop]: this.props.session[prop] });
    };
    // inititalize style if it is not defined.
    this.setState({
      style: this.props.session.style || {
        global: { spacing: 0, background: "#FFFFFF" },
        tabTitle: { fontSize: 14, color: "#000000" },
        background: { fontSize: 18, color: "#000000" },
        instruction: { fontSize: 18, color: "#282828" },
        example: { fontSize: 14, color: "#282828" },
        context: { fontSize: 14, color: "#282828" },
        response: { fontSize: 14, color: "#282828" },
        question: { fontSize: 14, color: "#282828" },
        answer: { fontSize: 14, color: "#282828" },
        utterance: { fontSize: 20, color: "#282828", textAlign: "center" },
        dialogInstruction: { fontSize: 14, color: "#282828" }
      }
    });

    // Workaround
    if (this.props.session.questionSurveys === undefined) {
      // Workaround
      let questions = lists2Questions(
        this.props.session.pollquestion || [],
        this.props.session.typeofpoll,
        this.props.session.radio,
        this.props.session.example,
        this.props.session.counterexample
      );
      this.setState({ "questionSurveys": questions });
    } else {
      this.setState(
        { "questionSurveys": addKeys(this.props.session.questionSurveys) }
      );
    }
    if (this.props.session.questionFeedbacks === undefined) {
      const sessionFeedbacks = this.props.session.feedback || [];
      // Workaround
      let feedbacks = lists2Questions(
        sessionFeedbacks,
        this.props.session.feedbackType || sessionFeedbacks.map((_) => ("Open ended")),
        this.props.session.feedbackradio || sessionFeedbacks.map((_) => ([]))
      );
      this.setState({ "questionFeedbacks": feedbacks });
    } else {
      this.setState(
        { "questionFeedbacks": addKeys(this.props.session.questionFeedbacks) }
      );
    }
    this.setState({
      requirements: addKeys(this.props.session.requirements || [])
    });

    this.setState({
      loading: false,
      payment: this.props.session.payment,
      recommendedPayment: calcRecommendedPayment(this.props.session.time)
    });

    this.setState({
      noHits: calcNoHits(this.props.session.nUnit, this.props.session.nAssignment, 1)
    })
  };

  traverseAndCopyByKey = (keys) => {
    /* This function traverse to the node according to the `keys`.
     * @{Array} keys: Specify the parent node as `this.state[key[0]][key[1]][...`.
     * Return:
     * @{Array}: nodes along the `keys` path will be returned. Each returned node
     * is a shallowcopy of the corresponding node.
     */
    const shallowCopy = (x) => (Array.isArray(x || []) ? (x || []).slice() : Object.assign({}, x));
    let path = [shallowCopy(this.state)];
    let node = this.state;
    for (const key of keys) {
      if (Array.isArray(node) && node[0].key !== undefined) {
        for (const [i, child] of node.entries()) {
          if (child.key === key) {
            node = shallowCopy(child);
            path[path.length - 1][i] = node;
            break;
          }
        }
      } else {
        if (node[key] !== undefined) {
          node = shallowCopy(node[key]);
        } else {
          node = [];
        }
        path[path.length - 1][key] = node;
      }
      path.push(node);
    }
    return path;
  };

  addByKey = (keys, toAdd = undefined) => {
    /* Add `toAdd` or `{content: ""}` to a node in `this.state`. It presumes that
     * the parent node is an array, and its children has an attribute `key`.
     * @{Array} keys: Specify the parent node as `this.state[key[0]][key[1]][...`.
     * @{Object} toAdd: Child that will be added to the parent node.
     */
    const path = this.traverseAndCopyByKey(keys);
    let node = path[path.length - 1];

    const newKey = (
      node.length == 0 ? 0 : node[node.length - 1].key + 1
    );
    toAdd = toAdd === undefined ? { "content": "" } : toAdd;
    node.push({ "key": newKey, ...toAdd });
    this.setState({ [keys[0]]: path[1] });
  };

  removeByKey = (keys) => {
    // Traverse to the parent of the target node.
    const path = this.traverseAndCopyByKey(keys.slice(0, -1));
    // The parent node
    let node = path[path.length - 1];
    // Look for the index that matches the key.
    let indexToRemove = -1;
    const keyToRemove = keys[keys.length - 1];
    for (let [i, x] of node.entries()) {
      if (x.key == keyToRemove) {
        indexToRemove = i;
      }
    }
    // In-place removal.
    if (indexToRemove >= 0) {
      node.splice(indexToRemove, 1);
    }
    // Update state.
    this.setState({ [keys[0]]: path[1] })
  };

  updateByKey = (keys, content) => {
    /* Update the state by key. 
     * @{Array} keys: the node to update is `this.state[key[0]][key[1]][...`.
     * @{Object} content: `Object.assign(node, content)` will be applied.
     */
    const path = this.traverseAndCopyByKey(keys);
    let node = path[path.length - 1];
    Object.assign(node, content);
    this.setState({ [keys[0]]: path[1] });
  };

  handlePdfInputChange(_, results) {
    const [e, file] = results[0];
    let pdf = e.target.result;
    this.setState({ consent: [file.name, pdf] });
  }

  handleSubmit(e) {
    /* Called when the submit/deploy button is clicked. */
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        values["consent"] = this.state.consent;
        this.submit(values, this.props.session._id);
      }
      else {
        console.log(err);
      }
    });
  };

  handleDeploy(e) {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values["consent"] = this.state.consent;
        this.submit(values, this.props.session._id);
        this.setState({ deploy: true });
      }
      else {
        if (e) {
          /* message.error("Some fileds are missing!"); */
          this.setState({ deploy: false });
        }
      }
    });
  }

  handleUploadConfig(event, results) {
    /* this.state.setState(results); */
    const [e, file] = results[0];
    try {
      let config = JSON.parse(e.target.result);
      this.setState({
        ...config,
        // trigger reset fileld defined in componentDidUpdate
        configRevision: (this.state.configRevision || 0) + 1
      });
      message.success("Success");
    } catch (except) {
      message.error("Fail to load from file.");
      console.log(except);
    }

  }

  submit(data, id) {
    /* POST data to the server. 
     * @{Object} data: data in the configuration form.
     * @{String} id: the unique id of this task.
     */
    let this_ = this;
    return fetch(serverUrl + this.saveURL + id, {
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
          this_.props.new_project_data(this_.taskName);
          this_.props.loadData(
            this_.props.session.createdAt,
            this_.props.session.password,
            this_.taskName
          );
        }
        else {
          message.success("Fail");
        }
      })
  }

  render() {
    throw "Not implemented!";
    return null;
  }

  _showGeneralConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <h3 style={{ "padding-left": "1%" }}>General Configuration</h3>
      <p></p>
      <FormItem
        {...formItemLayout}
        label={(
          <span>
            Load configuration from file &nbsp;
            <Tooltip title="Upload the configuration JSON file of a HIT. A JSON configuration file can be downloaded with the button at the end of this page.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
      >
        <FileReaderInput
          as="text"
          onChange={(e, results) => this.handleUploadConfig(e, results)}
        >
          <Button>
            <UploadOutlined /> Click to Upload
          </Button>
        </FileReaderInput>
      </FormItem>

      <FormItem
        {...(formItemLayout)}
        label={(
          <span>
            Background&nbsp;
            <Tooltip title="General introductions, the objective of this study, etc." >
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
        required={true}
      >
        {getFieldDecorator(`generic_introduction`, {
          initialValue: this.state.generic_introduction,
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please write background",
          }],
        })(
          <Input.TextArea placeholder="The objective of this study is ..."
            style={{ width: '90%', marginRight: 8 }} />
        )}
      </FormItem>
      <p style={{ "padding-left": "25%" }}>
        This <a href="https://mturkpublic.s3.amazonaws.com/docs/MTURK_BP.pdf">guide </a>
        provides helpful tips in creating clear, concise instructions for the workers.
      </p>
      <FormItem
        {...(formItemLayout)}
        label={(
          <span>
            General Instructions&nbsp;
            <Tooltip title={
              <div>
                <div>
                  Overall steps, what to label, etc.
                </div>
                <div>
                  Instructions should be specific, easy to read, and address any specific
                  actions workers should do when completing your HIT.
                </div>
                <div>
                  Stating any evaluation criteria that you are looking for in each HIT may
                  also prevent the need for HIT rejections and attract workers who will
                  complete the HIT accordingly.
                </div>
              </div>}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
        required={true}
      >
        {getFieldDecorator(`generic_instructions`, {
          initialValue: this.state.generic_instructions,
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please write instructions",
          }],
        })(
          <Input.TextArea placeholder="Please talk to the systems." style={{ width: '90%', marginRight: 8 }} />
        )}
      </FormItem>

      <FormItem
        {...formItemLayout}
        label={(
          <span>
            Enable Markdown (<a href="https://commonmark.org/help/">reference</a>) &nbsp;
            <Tooltip title={(
              'If Markdown is enabled, the background description '
              + ' and the instruction will be rendered as Markdown.'
              + 'Markdown is a lightweight text formating language. '
              + 'You can format a span of text in italic face or bold face '
              + 'and add hyperlinks as well as images with simple syntax. '
              + 'Bullet points are also supported. Please check the reference '
              + 'for more information.'
            )}
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
      >
        {getFieldDecorator('enableMarkdown',
          {
            initialValue: this.state.enableMarkdown || false,
            valuePropName: 'checked',
            onChange: (e) => { this.setState({ enableMarkdown: e }) }
          }
        )(
          <Switch />
        )}
      </FormItem>

      <FormItem
        {...(formItemLayout)}
        label={(
          <span>
            Time (minutes/HIT) &nbsp;
            <Tooltip title="Fill out the amount of time you expect the HIT to take in minutes">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
        required={true}
      >
        {getFieldDecorator(`time`, {
          initialValue: this.state.time,
          validateTrigger: ['onChange', 'onBlur'],
          onChange: this._onChangeTime,
          rules: [{
            required: true,
            whitespace: true,
            message: "Please fill out time in minutes",
          }],
        })(
          <Input.TextArea placeholder="20 (in minutes)" style={{ width: '90%', marginRight: 8 }} />
        )}
      </FormItem>
      <p style={{ "padding-left": "25%", "padding-right": "8%" }}>
        To estimate the time required for a HIT, you can ask your colleagues to do some HITs,
        then average the time they spend.
      </p>

      <FormItem
        {...(formItemLayout)}
        label={(
          <span>
            Payment (USD/HIT) &nbsp;
            <Tooltip title="Fill out the amount you will pay for the HIT">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        )}
        required={true}
      >
        {getFieldDecorator(`payment`, {
          initialValue: this.state.payment,
          onChange: (
            (e) => { e.preventDefault(); this.setState({ payment: parseFloat(e.target.value) }); }
          ),
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please fill out payment",
          }],
        })(
          <Input.TextArea placeholder="$8.00" style={{ width: '90%', marginRight: 8 }} />
        )}
      </FormItem>
      {/* Show info when payment is undefined */
        (this.state.recommendedPayment !== undefined
          && (isNaN(this.state.payment) || this.state.payment === "")) ?
          <p style={{ "margin-left": "25%", "color": "black", "font-weight": "bolder" }}>
            The recommended minimum payment is <b>{this.state.recommendedPayment}.</b>
          </p>
          : null}

      {/* Show with warning style when the payment < recommended */
        (this.state.recommendedPayment !== undefined
          && parseFloat(this.state.payment) < parseFloat(this.state.recommendedPayment)) ?
          <p style={{ "margin-left": "25%", "color": "darkorange", "font-weight": "bolder" }}>
            <b>The recommended minimum payment is <u>{this.state.recommendedPayment}</u>. </b> <br />
         The workers need a living wage $15/hr to meet their basic needs.
       </p>
          : null}

      {/*
          <FormItem
          {...formItemLayout}
          label={(
          <span>
          Speech mode&nbsp;
          <Tooltip title="Workers will talk to systems using automatic speech recognition.">
          <QuestionCircleOutlined />
          </Tooltip>
          </span>
          )}
          >
          {getFieldDecorator('speech',
          {
          initialValue: this.props.session.speech,
          valuePropName: 'checked'
          }
          )(
          <Switch/>
          )}
          </FormItem>
        */}

      {this.taskName === "interactive" ?
        <FormItem
          label="Interface"
          {...formItemLayout}
        >
          {getFieldDecorator('interface', { initialValue: this.state.interface })(
            <Radio.Group>
              <Radio.Button value="text">Text</Radio.Button>
              <Radio.Button value="speech">Speech</Radio.Button>
              <Radio.Button value="both">Both text and speech</Radio.Button>
              <Radio.Button value="continuous">Continuous speech</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        : null}
    </>
    );
  }

  _onChangeTime = (event) => {
    event.preventDefault()
    const time = event.target.value;
    this.setState({ recommendedPayment: calcRecommendedPayment(time) });
  }

  _onChangeTaskNo = (event) => {
    event.preventDefault()
    const tasks = event.target.value;
    this.setState({ noHits: calcNoHits(tasks, this.state.nAssignment, convoLength), nUnit: tasks })
  }

  _onChangeAssignmentNo = (event) => {
    event.preventDefault()
    const tasks = event.target.value;
    this.setState({ noHits: calcNoHits(this.state.nUnit, tasks, convoLength), nAssignment: tasks })
  }

  _showAnnotationConfig(textTask, dataLength) {
    /* Params:
     * @{String} TextSample: the thing to be annotated in this task, e.g. "conversation".
     * This will be used to fill the help text in the configuration fields.
     */
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const { helpTextNAnnotation } = this.constructor;

    convoLength = dataLength

    return (<>
      <div style={{ "padding-left": "1%" }}>
        <FormItem
          {...(formItemLayout)}
          label={(
            <span>
              # of {textTask}/HIT &nbsp;
              <Tooltip title={(
                `Specify the number of ${textTask}(s) the `
                + "worker needs to annotate in each HIT. "
                + "For example, if 5 is specified, then the worker "
                + `will need to annotation 5 ${textTask}s before they `
                + "can submit the annotations."
              )}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
          required={true}
        >
          {getFieldDecorator(`nUnit`, {
            initialValue: this.state.nUnit,
            onChange: this._onChangeTaskNo,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: (
                `Please specify the number of ${textTask}(s) in each HIT.`
              )
            }],
          })(
            <Input.TextArea placeholder="5" style={{ width: '90%', marginRight: 8 }} />
          )}
        </FormItem>
        <FormItem
          {...(formItemLayout)}
          label={(
            <span>
              # of annotations/{textTask} &nbsp;
              <Tooltip title={(
                `Please specify the number of workers you want a ${textTask} to be annotated by. `
                + `For example, if 5 is specified, each ${textTask} will be shown to 5 different workers, `
                + `and so each ${textTask} will be annotated 5 times.`
              )}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
          required={true}
        >
          {getFieldDecorator(`nAssignment`, {
            initialValue: this.state.nAssignment,
            onChange: this._onChangeAssignmentNo,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: "Please specify the number of annotations per ${textTask}.",
            }],
          })(
            <Input.TextArea placeholder="5" style={{ width: '90%', marginRight: 8 }} />
          )}
        </FormItem>
        {this.state.noHits !== undefined ?
          <div style={{ "margin-left": "25%", "color": "darkorange" }}>
            <span>You should deploy a total of {this.state.noHits} HITs on Amazon Mechanical Turk.</span>
          </div> : null}
      </div>
    </>);
  }

  _showQualityControlConfig(textTask) {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;

    return (<>
      <h3 style={{ "padding-left": "1%" }}>Task Units for Quality Control</h3>
      <p style={{ "padding-left": "1%" }}>
        In this section, you can configure whether or not you want to include
        some task units in each HIT for quality control.
        Theses task units can help you dectect bots or low-quality workers.
        Two types of task units are available for quality control:
        <ul>
          <li>
            Duplicated task units: These are used to compare the worker to
            themself. If you decide to use duplicated task
            units, the specified number of randomly selected task units in the
            HIT will be duplicated. That is to say, the worker will have to
            annotate some of the task units twice. A responsible worker should
            provide the same annotation for the duplicated question as before.
            By checking the consistency of their answers, bots and low-quality workers
            can be detected.
          </li>
          <li>
            Golden task units: These are used to compare the worker to an "expert" whose
            answers are confirmed as correct. If you decide to use golden task units and upload
            some data with golden answers, the specified number of randomly selected task
            units in the golden data will be given to the workers in each HIT.
            With these golden task units, DialCrowd can compare the annotations of a worker
            and the golden answers. Workers of low-quality, who usually answer incorrectly,
            can be detected accordingly.
          </li>
        </ul>
        <b>The number of task units for quality control is recommended to be 10% of the number of
          task units in a HIT.</b>
      </p>
      <div style={{
        border: "2px solid black",
        margin: "10px",
        padding: 24
      }}>
        <FormItem
          {...(formItemLayout)}
          label={(
            <span>
              # of duplicated task units &nbsp;
              <Tooltip title={(
                `Specify the number of duplicated ${textTask}(s) the `
                + "to be included in each HIT. "
                + "These duplicated task units can be used to detect "
                + "annotators of low quality. "
                + "When the number of duplicated tasks is greater than 0, "
                + "in each HIT, randomly selected task units will be "
                + "duplicated. With those duplicated task units, "
                + "the DialCrowd system can automatically "
                + "check whether a worker answered them consistently. "
                + "A bad worker may be detected if the worker simply "
                + "answered the questions randomly and annotated the "
                + "duplicated questions with different answers."
              )}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
          required={true}
        >
          {getFieldDecorator(`nUnitDuplicated`, {
            initialValue: `${this.state.nUnitDuplicated || 0}`,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: (
                `Please specify the number of duplicated ${textTask}(s) in each HIT.`
              )
            }],
          })(
            <InputNumber style={{ width: '90%', marginRight: 8 }} />
          )}
        </FormItem>
        <FormItem
          {...(formItemLayout)}
          label={(
            <span>
              # of golden task units &nbsp;
              <Tooltip title={(
                `Specify the number of golden task units `
                + "to be included in each HIT. "
                + "A golden task unit is a unit with golden answer that you know is correct. "
                + "These golden task units can be used to detect "
                + "annotators of low quality. Specifically, with those "
                + "golden task units, DialCrowd can automatically "
                + "check whether a worker answered them correctly by comparing "
                + "their annotation with the golden answer. "
                + "A bad worker may be detected if the worker simply "
                + "answered the questions randomly and annotated "
                + "golden task units incorrectly."
              )}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
          required={true}
        >
          {getFieldDecorator(`nUnitGolden`, {
            initialValue: `${this.state.nUnitGolden || 0}`,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: (
                `Please specify the number of ${textTask}(s) in each HIT.`
              )
            }],
          })(
            <InputNumber placeholder="0" style={{ width: '90%', marginRight: 8 }}
              defaultValue={this.state.nUnitGolden || 0} />
          )}
        </FormItem>
        {this._showDataUpload(true)}
      </div>
    </>);
  }

  _showConsentConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <h3 style={{ "padding-left": "1%" }}>Consent Form</h3>
      <p style={{ "padding-left": "1%" }}>
        You can have a consent form and some checkboxes that the workers must agree with before they
        can start working.
        For example, you may want to inform the workers of their rights, or possible risks when doing
        the task.
        When a worker opens the web page of the task, this consent form will be shown in
        a pop-up window. The workers must agree with it to proceed.
      </p>
      <div style={{ border: "2px solid black", margin: "10px", padding: 24 }} >
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Consent form &nbsp;
              <Tooltip title="Upload the consent form you want to show to the workers.">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
        >
          <FileReaderInput
            as='url'
            onChange={(e, results) => this.handlePdfInputChange(e, results)}
          >
            <Button
              style={{ width: '90%' }}
            >
              <UploadOutlined /> Click to Upload
            </Button>
          </FileReaderInput>
          {this.state.consent && this.state.consent.length > 0 ?
            <span>{this.state.consent[0]}</span> : null}
        </FormItem>
        <FormItem {...formItemLayoutWithOutLabel}>
          {this.state.consent && this.state.consent.length > 0 ?
            <PreviewButton consent={this.state.consent[1]} /> :
            <PreviewButton consent={"hi"} />}
        </FormItem>
        <DynamicItems
          form={this.props.form}
          formItemLayout={formItemLayout}
          removeByKey={this.removeByKey}
          addByKey={this.addByKey}
          updateByKey={this.updateByKey}
          rootKeys={["requirements"]}
          items={this.state.requirements}
          title="Consent Checkboxes"
          textHelp={(
            "A checkbox a workers must agree with before working on "
            + 'the task, e.g. "I am over 18 years old." It can also be '
            + 'a statement, e.g. "I understand my answer will be published."'
          )}
          textAdd="Add consent checkbox"
          placeholder="I am over 18 years old."
        />

        <PreviewConsent consent={this.state.consent ? this.state.consent[1] || "" : ""}
          requirements={this.state.requirements} />
      </div>
    </>);
  }

  _showSurveyConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const { instructionSurvey, helpTextSurveyQuestion } = this.constructor;
    return (<>
      {/* Surveys */}
      <h3 style={{ "padding-left": "1%" }}>General Questions</h3>
      <p style={{ "padding-left": "1%" }}>{instructionSurvey}</p>
      <QuestionList
        form={this.props.form}
        formItemLayout={formItemLayout}
        removeByKey={this.removeByKey}
        addByKey={this.addByKey}
        updateByKey={this.updateByKey}
        questions={this.state.questionSurveys}
        rootKey={["questionSurveys"]}
        questionFieldLabel="Question"
        questionHelpText={helpTextSurveyQuestion}
        textAddQuestion="Add "
        textInstruction={instructionSurvey}
        placeholderQuestion="Can you identify the difference between the systems?"
        placeholderExample="Yes, system A reacts like a real human most."
        placeholderCounterexample="I want the system to be more sociable."
        placeholderOption="Yes, somewhat."
      />
    </>);
  }

  _showFeedbackConfig() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <h3 style={{ "padding-left": "1%" }}>Feedback</h3>
      <p style={{ "padding-left": "1%" }}>
        You can decide whether or not you want the optional feedback question of
        <span style={{ "font-weight": "800" }}> "Please let us know if you have any feedback." </span>
        This question will be shown after the worker finishes the task.
        Feedback can be very important in improving the quality of your task.
        Although not all workers will give you feedback, usually you can get some
        useful feedback that will help you improve your task, so you can collect
        data of higher quality.</p>
      <div style={{ border: "2px solid black", margin: "10px", padding: 24 }} >
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Have a Feedback Question &nbsp;
              <Tooltip title='Set whether you want to have an optional feedback question.'>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('hasFeedbackQuestion',
            {
              initialValue: this.state.hasFeedbackQuestion,
              valuePropName: 'checked'
            }
          )(
            <Switch />
          )}
        </FormItem>

      </div>
    </>);
  }

  _showAppearanceConfig(textStyleExtras = []) {
    /* Params:
       {@Array} textStyleExtras: Specify extra text style configuration. 
       Check the variable `textStyles` for the format of its elements.
     */
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    const style = this.state.style || { global: {} };
    const textStyles = [
      {
        name: 'Title',
        fieldName: 'tabTitle',
        explain: "Set the titles styles of the tabs in the worker's view"
      }, {
        name: 'Background',
        fieldName: 'background',
        explain: "Set the text style for the background description part."
      }, {
        name: 'Instruction',
        fieldName: 'instruction',
        explain: "Set the text style for the instruction part."
      }, {
        name: 'Examples',
        fieldName: 'example',
        explain: "Set the style of the text in the example/counterexample table in the worker's view."
      },
    ].concat(textStyleExtras);

    return (<>
      <h3 style={{ "padding-left": "1%" }}>Appearance</h3>
      <p style={{ "padding-left": "1%" }}>
      </p>
      <div style={{ border: "2px solid black", margin: "10px", padding: 24 }} >
        {/* Background color. */}
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Background Color &nbsp;
              <Tooltip title='Set the background color that workers see.'>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
        >
          <ColorPicker
            form={this.props.form}
            name="['style']['global']['backgroundColor']"
            initialValue={style.global.backgroundColor || "#FFFFFF"}
          />
        </FormItem>

        {textStyles.map(
          textStyle => (
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  Text Style - {textStyle.name} &nbsp;
                  <Tooltip title={textStyle.explain}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              )}
            >
              <FontPicker
                form={this.props.form}
                keys={['style', textStyle.fieldName]}
                previewText="Preview Text"
                updateByKey={this.updateByKey}
                {...(style[textStyle.fieldName] || {})}
              />
            </FormItem>
          )
        )}

        {/* Spacing */}
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Spacing Adjustment &nbsp;
              <Tooltip title={("Adjust the space between elements in the worker's view. "
                + "If you want a denser view, you can give a minus value. "
                + "Be aware that lines may overlap with each other when the spacing is too small.")}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator(`['style']['global']['spacing']`, {
            initialValue: `${style.global.spacing || 0}`,
            validateTrigger: ['onChange', 'onBlur'],
            rules: [{
              required: true,
              whitespace: true,
              message: (
                `Please specify adjustment.`
              )
            }],
          })(
            <InputNumber placeholder="0" style={{ width: '10%', marginRight: 8 }}
              defaultValue={style.global.spacing || 0} />
          )}
        </FormItem>

      </div>
    </>);
  }

  _showButtons() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout, formItemLayoutWithOutLabel } = this;
    return (<>
      <br />
      <div style={{ "text-align": "center", "padding-left": "60px" }}>
        <span>Please save before you preview/download</span>
      </div>
      <FormItem {...formItemLayoutWithOutLabel}>
        <Button
          type="primary" style={{ width: '90%' }} htmlType="submit">Save</Button>
        <Button
          onClick={() => window.open(clientUrl + "/worker_interactive?MID=dialcrowd&ID=" + this.props.session._id)}
          type="primary" style={{ width: '90%' }} icon="EyeOutlined">
          Preview
        </Button>

        <br />
        {/* {this._showVisibility()} */}
        <Button type="primary" style={{ width: '90%' }}
          onClick={() => this._saveAsJSON()}
        >
          Download the Configuration as JSON
        </Button>

        <div style={{ "padding-top": "5px" }}>
          {this._showTemplate()}
        </div>
      </FormItem>
    </>);
  }

  _showTemplate() {
    /* Ex. return <QualityTemplate thisstate={this.props.session}/>; */
    throw "Not implemented!";
  }

  _saveAsJSON() {
    let config = {};
    const keys = [
      'consent', 'generic_instructions', 'generic_introduction', 'hasFeedbackQuestion',
      'interface', 'payment', 'requirements', 'time',
      'questionSurveys', 'questionSystems',
      'category_data', 'sequence_data', 'quality_data',
      'dataGolden', 'nAssignment', 'numofsent',
      'nUnit', 'nUnitDuplicated', 'nUnitGolden', 'payment',
      'questionCategories', 'questionEntities', 'questionQualities', 'style'
    ];
    for (const key of keys) {
      if (this.state[key] !== undefined) {
        config[key] = this.state[key];
      }
    }
    var blob = new Blob(
      [JSON.stringify(config, null, 2)],
      { type: 'text/plain;charset=utf-8' },
    )
    saveAs(blob, `${this.props.session.name}.json`)
  }

  _showVisibility() {
    const { getFieldDecorator } = this.props.form;
    const { formItemLayout } = this;
    return (<>
      <div style={{ "padding-left": "35%" }}>
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Visible to Workers &nbsp;
              <Tooltip title='Set the visibility of this task in the list of public DialCrowd HITs ("Worker" in the navigation menu).'>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('deploy',
            {
              initialValue: this.state.deploy,
              valuePropName: 'checked',
              onChange: (e) => { this.handleDeploy(e); }
            }
          )(
            <Switch />
          )}
        </FormItem>
      </div>
    </>);
  }
};

function calcRecommendedPayment(time) {
  time = parseFloat(time)
  if (isNaN(time)) {
    return undefined;
  } else {
    return (15 * time / 60).toFixed(2);
  }
}

function calcNoHits(nUnit, nAssignment, nconvo) {
  if (isNaN(nUnit) || isNaN(nAssignment) || isNaN(nconvo)) {
    return undefined;
  } else {
    return (nconvo * nAssignment / nUnit);
  }
}


export default Configure;
