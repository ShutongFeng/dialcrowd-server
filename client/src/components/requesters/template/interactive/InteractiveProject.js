import React from "react";
import NewProject from '../../../NewProject.js';
import ProjectList from '../../../ProjectList.js'
import {connect} from "react-redux";
import HelpInteractive from "../../../help/HelpInteractive";

class InteractiveProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dialogs: []}
  }

  componentDidMount() {
  }

  render() {
    return <div>
      <h1> Interactive Dialog Tasks </h1>
      <div style={{display: "flex"}}>
        <NewProject project={"interactive"}/>
        <HelpInteractive/>
      </div>
      <ProjectList data={this.props.data} history={this.props.history} url={"interactive"}/>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    data: state.interactive,
  };
}


const mapDispatchToProps = {};


export default connect(mapStateToProps, mapDispatchToProps)(InteractiveProject);

