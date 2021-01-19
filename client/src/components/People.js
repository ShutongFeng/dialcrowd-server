import React from "react";

class People extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dialogs: []}
  }

  render() {
    return <div>
      <h1> People </h1>
      <p>Jessica Huynh,
        Carnegie Mellon University</p>
      <p>Ting-Rui Chiang,
        Carnegie Mellon University</p>
      <p><a href="http://www.cs.cmu.edu/~kyusongl/" target={"_blank"} rel="noopener noreferrer">Kyusong Lee</a>,
        Carnegie Mellon University</p>
      <p><a href="http://www.cs.cmu.edu/~awb/" target={"_blank"} rel="noopener noreferrer">Maxine Eskenazi</a>, Carnegie
        Mellon University </p>
      <p><a href="https://www.cs.cmu.edu/~jbigham/" target={"_blank"} rel="noopener noreferrer">Jeffrey Bigham</a>,
        Carnegie Mellon University </p>

      <h1> Publications </h1>
      <p>Kyusong Lee, Tiancheng Zhao, Alan W Black and Maxine Eskenazi <a href="http://aclweb.org/anthology/W18-5028"
                                                                          target="_blank" rel="noopener noreferrer">DialCrowd:
        A toolkit for easy
        dialog system assessment</a>. Proceedings of the International Conference on Spoken Dialogue Systems Technology
        (SIGDIAL 2018) [DEMO PAPER], July 2018, Melbourne
      </p>
      <p><a
          href={"https://scholar.googleusercontent.com/scholar.bib?q=info:G7D4V4hp5xkJ:scholar.google.com/&output=citation&scisig=AAGBfm0AAAAAW2aMLYe-N7TdJioOXsEjSn0HCTsTlM8Y&scisf=4&ct=citation&cd=-1&hl=en"}
          target={"_blank"} rel="noopener noreferrer">[BibTeX]</a></p>
      <h1> Questions </h1>
      <p> Contact at kyusonglee@gmail.com </p>

    </div>
  }
}

export default People
