import React from "react";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogs: [] }
  }

  render() {
    return <div>
      <h1> What is DialCrowd? </h1>
      <p>In order to make testing easier and more automated, a framework for connecting to a crowdsourcing entity such
        as (but not only) <a href="https://www.mturk.com/">Amazon Mechanical Turk (AMT)</a> and for rapidly creating and
        deploying tasks. </p>
      <p>In our experience, there are often a small set of standardized test scenarios (templates) that cover a large
      portion of the dialog tasks that are run on AMT. When we make those scenarios easy to create, testing is faster,
      and less burdensome. For some who are new to the area, the use of these scenarios guides them to accepted
        testing structures that they may not have been aware of.</p>
      <p>At the outset, the Task Creation Toolkit will use standard templates that are easy to flesh
        out. Later, when the toolkit is finished, the community will be invited to add more.</p>
      <p>The Toolkit will aid in other aspects of running tasks such as, in relevant cases, reminding the requester to
      post a consent form for explicit permission to use the data. We will ensure that the results are collected
      ethically and can be made available to the community with as few restrictions as possible that do not compromise
        a worker’s privacy.</p>
      <h1> People </h1>
      <p><a href="https://www.cs.hhu.de/en/research-groups/dialog-systems-and-machine-learning/our-team/team.html" target={"_blank"} rel="noopener noreferrer">Songbo Hu</a>,
        Intern@Heinrich Heine University Düsseldorf</p>
      <p><a href="https://www.cs.hhu.de/en/research-groups/dialog-systems-and-machine-learning/our-team/team/cv-gasic.html" target={"_blank"} rel="noopener noreferrer">Prof. Milica Gašić</a>,
        Heinrich Heine University Düsseldorf
      </p>
      <p><a href="http://heckmichael.de/" target={"_blank"} rel="noopener noreferrer">Dr. Michael Heck</a>,
        Heinrich Heine University Düsseldorf
      </p>
      <p><a href="http://www.nflubis.com/" target={"_blank"} rel="noopener noreferrer">Dr. Nurul Fithria Lubis</a>,
        Heinrich Heine University Düsseldorf
      </p>
      <p><a href="https://carelvniekerk.github.io/" target={"_blank"} rel="noopener noreferrer">Carel van Niekerk</a>,
        Heinrich Heine University Düsseldorf
      </p>
      <p><a href="https://www.cs.hhu.de/en/research-groups/dialog-systems-and-machine-learning/our-team/team.html" target={"_blank"} rel="noopener noreferrer">Shutong Feng</a>,
        Heinrich Heine University Düsseldorf
      </p>
      <p><a href="https://chrisgeishauser.github.io/" target={"_blank"} rel="noopener noreferrer">Christian Geishauser</a>,
        Heinrich Heine University Düsseldorf
      </p>
      <p><a href="https://hsien1993.github.io/" target={"_blank"} rel="noopener noreferrer">Hsien-Chin Lin</a>,
        Heinrich Heine University Düsseldorf
      </p>

      <h1> Contact </h1>
      <p> Contact at dialog@hhu.de</p>


    </div>
  }
}

export default Home
