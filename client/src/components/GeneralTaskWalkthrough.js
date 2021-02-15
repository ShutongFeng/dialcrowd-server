import React, { Component } from 'react';
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;

class GeneralTaskWalkthrough extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <div>
                We provide an in depth walkthrough of a generic task in DialCrowd. This includes
                the intent and entity classifications as well as the quality annotation. The wording may
                be slightly different across tasks, but the general functionality remains the same.
                Screenshots are taken from the quality annotation task.
            </div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="General Configuration" key="1">
                    <div>
                        <img src="/img/config.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <h4>Load configuration from file</h4>
                        <div>
                            After you finish configuring any task, you are able to save its configuration
                            in JSON format (button located at the bottom of the configure page). To start
                            a new task with a similar configuration, you can upload that JSON file here and
                            the task will automatically populate with your original fields. You can then
                            make small changes wherever needed.
                    </div>
                        <br />
                        <h4>Background</h4>
                        <div>
                            In order to give your workers some knowledge about your task, you can fill out
                            a short background on why you are doing this task, the objective you aim to fulfill,
                            etc.
                    </div>
                        <br />
                        <h4>General Instructions</h4>
                        <div>
                            This is where you will put any instructions you wish to provide to the workers. For example,
                            the overall steps you wish the worker to complete the task in, what to label, etc.
                            Instructions should be specific, easy to read, and address any specific actions workers
                            should do wheh completing your HIT. Stating any evaluation criteria that you are looking for in
                            each HIT may also prevent the need for HIT rejections and attract workers who will complete
                            the HIT accordingly. We also provide a link to a guide given by Amazon Mechanical Turk about best
                            practices in creating clear and concise instructions.
                    </div>
                        <br />
                        <h4>Time (minutes/HIT)</h4>
                        <div>
                            Here, you can fill out how many minutes you expect each HIT to take. We suggest that before making
                            your HIT available to workers, you should test your HIT with your colleagues in order to obtain
                            a more accurate time estimate.
                    </div>
                        <br />
                        <h4>Payment (USD/HIT)</h4>
                        <div>
                            Based on the time you estimate, you will want to put in the payment for the workers per HIT. We suggest
                            an hourly wage of $15 so that workers can earn a fair wage, and there will be a popup that automatically
                            calculates this for you if needed. There is by no means a requirement to use our suggested hourly wage,
                            but we strongly suggest this to be fair to the workers and their time.
                    </div>
                    </div>
                </TabPane>
                <TabPane tab="Consent Form" key="2">
                    <div>
                        <img src="/img/consent.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <h4>Consent form</h4>
                        <div>
                            You can upload your consent form here as a PDF. The button for "Preview Consent Form"
                            will show you how the consent form will look to the workers.
                    </div>
                        <br />
                        <h4>Consent Checkboxes</h4>
                        <div>
                            Here, you can specify checkboxes which the workers must check in order to do your HIT.
                            For example, "I am over 18 years old", or "I understand my answer will be published".
                            You can add as many checkboxes as you need. The "Preview the Above Consent Questions in Worker View"
                            button will show you the consent form PDF as well as the checkboxes after it.
                    </div>
                    </div>
                </TabPane>
                <TabPane tab="Data" key="3">
                    <div>
                        <img src="/img/data.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <h4>Upload your data</h4>
                        <div>
                            <div>
                                You should upload your data needed in your task here. For the quality annotation task, we want
                                the format to be:
                        </div>
                            <div>
                                Context
                        </div>
                            <div>
                                System: system utterance
                        </div>
                            <div>
                                User: user utterance
                        </div>
                            <div>
                                Response
                        </div>
                            <div>
                                System: system utterance
                        </div>
                            <br />
                            <div>
                                For the intent and sequence classification tasks, we want each of the sentences separated by a new line.
                                In order to check if your data is been correctly uploaded, you can check the table that pops up. Each
                                context/response pair will be its own entry in the table with a unique ID, and the dropdown of that entry
                                will show the context system/user utterances in order.
                        </div>
                        </div>
                        <br />
                        <h4># of conversations/HIT</h4>
                        <div>
                            Here, you can specify the number of conversations the worker needs to annotate in each HIT. For example, if we
                            type 1, the worker will only need to annotate 1 context/response pair before they can submit. We suggest keeping this
                            number low if you ask a lot of questions about the pair so the worker does not tire out.
                    </div>
                        <br />
                        <h4># of annotations/conversation</h4>
                        <div>
                            This is where you specify how many annotations you want per conversation. If you type 2 here, each
                            context/response pair will be shown to 2 different workers and annotated twice.
                    </div>
                        <br />
                    We calculate the total number of HITs you should deploy on Amazon Mechanical Turk. This is calculated by
                    # conversations * # of annotations/conversation / # conversations/HIT.
                </div>
                </TabPane>
                <TabPane tab="Tasks Units for Quality Control" key="4">
                    <div>
                        <img src="/img/qualitycontrol.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <h4># of duplicated task units</h4>
                        <div>
                            To reiterate, duplicated task units are shown again to the worker in the same HIT to test the
                            worker's consistency.
                    </div>
                        <br />
                        <h4># of golden task units</h4>
                        <div>
                            Golden task units are used to compare a worker against an expert on the same question.
                    </div>
                        <br />
                        <h4>Upload data with answer</h4>
                        <div>
                            You will upload the data with the golden answers here. The format is the same as the data you uploaded
                            before, but under the context/response pairs, we add:
                        <div>
                                Answer
                        </div>
                            <div>
                                Answer to the 1st question
                        </div>
                        </div>
                    </div>
                </TabPane>
                <TabPane tab="General Questions" key="5">
                    <div>
                        <img src="/img/generalquestion.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <h4>Type of Question</h4>
                        <div>
                            We provide three types of possible questions: likert scale, open ended, and multiple choice.
                            The likert scale has 3, 5, or 7 stars. The open ended task provides one text field for the workers
                            to input text. Lastly, the multiple choice option gives you the chance to add options for the choices.
                            The "Preview this Question in Worker View" will show the question as it is shown to the workers.
                    </div>
                        <br />
                        <h4>Example and Explanation</h4>
                        <div>
                            You can provide example responses to the questions you ask above. This is to help the worker understand
                            what is an acceptable answer, and thus ensures better quality of your collected data. The box on the left
                            is for the example, and the box on the right is the reasoning why the example is a good response.
                    </div>
                        <br />
                        <h4>Counterexample and Explanation</h4>
                        <div>
                            Same as above, you can provide counterexamples and reasoning so that workers won't provide answers similar to
                            those that you do not want.
                    </div>
                        <br />
                    The "Preview the Examples and Counterexamples in Worker View" button will show a table with the questions, and
                    their respective examples and counterexamples. We suggest at least adding one example and counterexample for each
                    question.
                </div>
                </TabPane>
                <TabPane tab="Feedback" key="6">
                    <div>
                        <img src="/img/feedback.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <div>
                            When you turn on this option, the workers will be provided with a feedback text box below the HIT.
                    </div>
                    </div>
                </TabPane>
                <TabPane tab="Options" key="7">
                    <div>
                        <img src="/img/options.png" style={{ border: "1px solid black" }} />
                        <br />
                        <br />
                        <div>
                            There are four options here:
                        <br />
                            <div>
                                <b>Save</b> saves your HIT.
                        </div>
                            <br />
                            <div>
                                <b>Preview</b> allows you to see the HIT from the worker's perspective. Remember to save before
                            you preview.
                        </div>
                            <br />
                            <div>
                                <b>Save Configuration as JSON</b> downloads the JSON configuration of the task so you are able to
                            upload that configuration in a new task if you want to slightly edit it.
                        </div>
                            <br />
                            <div>
                                <b>Amazon Mechanical Turk Template</b> provides code for the interface on Mechanical Turk. You can copy
                            and paste this code so that workers can generate a link to DialCrowd then submit the confirmation code
                            we provide after they completed the HIT so they are linked to their Mechanical Turk ID. It is also important
                            to mention that DialCrowd is <b>NOT</b> exclusively made to connect to Mechanical Turk; you are free to use
                            other crowdsourcing platforms.
                        </div>
                        </div>
                    </div>
                </TabPane>
            </Tabs></div>
    }

}

export default GeneralTaskWalkthrough;