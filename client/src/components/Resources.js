import React from "react";
import RejectionTemplate from "./RejectionTemplate";

class Resources extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dialogs: []}
  }

  render() {
    return <div>
      <h1>Qualification Tests and Worker Requirements</h1>
      <u1>
        <li><a href="https://blog.mturk.com/tutorial-understanding-requirements-and-qualifications-99a26069fba2">
        Worker requirements</a> allow you to filter workers by HIT approval rate, number of HITs approved, 
        etc., which can help you select more experienced workers</li>
        <li><a href="https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/Concepts_QualificationsArticle.html#qualification-tests">
        Qualification Tests</a> allow you to ask the worker a set of questions and depending on their answers, will assign 
        a certain qualification type to them, which may allow or exclude them from doing the HIT</li>
        <li>If you have a prior relationship with the worker,
        you can automatically assign qualification types beforehand as well</li>
      </u1>
      <br></br>
      <h1>Rejecting a HIT vs. Blocking a Worker</h1>
      <u1>
        <li>Both actions can negatively impact both your and the worker's reputation, so use them with caution</li>
        <li><b>Rejecting</b> a HIT means that the worker will not be paid, but they could potentially work on your future HITs</li>
        <li><b>Blocking</b> a worker excludes them from all of your future HITs</li>
        <li>Both <a href="https://docs.aws.amazon.com/AWSMechTurk/latest/RequesterUI/ReversingRejectedAssignment.html">rejecting </a>  
        and <a href="https://docs.aws.amazon.com/AWSMechTurk/latest/RequesterUI/UnblockingaWorker.html">blocking</a> can be reversed</li>
      </u1>
      <br></br>
      <h1>Informing workers why a HIT was rejected</h1>
      <u1>
          <li>When you reject a HIT, you should provide <b>sufficient reason why</b></li>
          <li>We provide a template which can generate sample responses below</li>
      </u1>
      <br></br>
      <RejectionTemplate/>
      <h1>Addressing Appeals</h1>
      <u1>
        <li>When you receive an appeal from a worker about a rejected HIT, it is important to address their email in a <b>timely manner</b></li>
        <li>If your initial response when rejecting the HIT was not clear, clarify which instruction or evaluation metric was not followed</li>
        <li>If you have made a mistake, be sure to overturn the rejection once you have confirmed that</li>
      </u1>
      <br></br>
      <h1>Contacting Amazon about bots</h1>
      <u1>
        <li>When you discover a bot, you can contact Amazon Mechanical Turk through this <a href="https://support.aws.amazon.com/#/contacts/aws-mechanical-turk">form</a></li>
        <li>You can also click on "Report this HIT" in the Mechanical Turk interface</li>
      </u1>
      <br></br>
      <h1>Turker Forums</h1>
      <u1>
        <li><a href="https://turkopticon.ucsd.edu">Turkopticon</a>, which allows 
      you review requesters based on communicativity, generosity, fairness, and promptness</li>
        <li><a href="https://forum.turkerview.com">TurkerView</a>, where workers 
      can review specific tasks from requesters</li>
        <li>These forums are important for a requester's reputation, so responding to workers' feedback and engaging with them to improve 
      your HIT should be remembered</li>
      </u1>
      <br></br>
      <h1>Best Practices</h1>
      <u1>
        <li>For the first 20 or so minutes after you have released your HIT, monitor your email for any questions from workers</li>
        <li>Be sure to check your <b>AMT email</b> regularly in order to keep lines of communication open with the workers</li>
        <li>Incorporate any feedback you receive as needed to ensure workers can complete your HIT to the best they can</li>
        <li>Approve or reject HITs in a <b>timely manner</b></li>
        <li>If your HIT involves a long open response question, be sure to state that in the title of your HIT, or in the general instructions on AMT</li>
      </u1>
    </div>
  }
}


export default Resources
