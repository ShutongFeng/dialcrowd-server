import React from "react";
import NewProject from '../../../NewProject.js';
import ProjectList from '../../../ProjectList.js'
import {connect} from "react-redux";
import HelpCategory from "../../../help/HelpCategory";

class CategoryProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dialogs: []}
  }

  componentDidMount() {
  }

  render() {
    console.log(this.props.data);
    console.log(this.props.history);
    return <div>
      <h1> Intent Classification Tasks</h1>
      <div style={{display: "flex"}}>
        <NewProject project={"category"}/>
        <HelpCategory/>
      </div>
      <ProjectList data={this.props.data} history={this.props.history} url={"category"}/>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    data: state.category,
  };
}


const mapDispatchToProps = {};


export default connect(mapStateToProps, mapDispatchToProps)(CategoryProject);

