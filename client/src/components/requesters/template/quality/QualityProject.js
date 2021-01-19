import React from "react";
import NewProject from '../../../NewProject.js';
import ProjectList from '../../../ProjectList.js'
import {connect} from "react-redux";
import HelpQuality from "../../../help/HelpQuality";

class QualityProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dialogs: []}
  }

  componentDidMount() {
  }

  render() {
    return <div>
      <h1> Quality Check Tasks </h1>
      <div style={{display: "flex"}}>
        <NewProject project={"quality"}/>
        <HelpQuality/>
      </div>
      <ProjectList data={this.props.data} history={this.props.history} url={"quality"}/>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    data: state.quality,
  };
}


const mapDispatchToProps = {};


export default connect(mapStateToProps, mapDispatchToProps)(QualityProject);

