import React from "react";
import NewProject from '../../../NewProject.js';
import ProjectList from '../../../ProjectList.js'
import {connect} from "react-redux";
import HelpSequence from "../../../help/HelpSequence";

class SequenceProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dialogs: []}
  }

  componentDidMount() {
  }

  render() {
    return <div>
      <h1> Entity Classification Tasks</h1>
      <div style={{display: "flex"}}>
        <NewProject project={"sequence"}/>
        <HelpSequence/>
      </div>
      <ProjectList data={this.props.data} history={this.props.history} url={"sequence"}/>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    data: state.sequence
  };
}


const mapDispatchToProps = {};


export default connect(mapStateToProps, mapDispatchToProps)(SequenceProject);

