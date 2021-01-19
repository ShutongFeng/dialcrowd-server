import {serverUrl} from "../../../../configs";
import DataStatistics, {renderWithColor} from "../DataStatistics";


class InteractiveDataStatistics extends DataStatistics {
  /* Params:
   * {@String} url: Url from which statistics can be fetched.
   * {@Array} questions: Array of questions. `propertyNameQuestions` 
   * is used only when this prop is not given.
   * {@String} propertyNameQuestions: Name of the question list, e.g. questionSurveys.
   * {@String} id: id of the project.
   */

  static columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question'
    },
    {
      title: "Cohen's Kappa",
      dataIndex: "Cohen's Kappa",
      key: "Cohen's Kappa",
      render: renderWithColor
    }
  ];
  static subColumns = undefined;

  constructor (props) {
    super(props);
  }

  getResults () {
    /* Interactive task does not have task units, 
       and this function is to retrieve agreements for each unit.
       Therefore, we simply do nothing here. */
  }
  
  getStatistics () {
    /* Retrieve dataAgreements. */
    fetch(this.props.url).then(res => res.json()).then(res => {
      this.setState({
        questions: res[this.props.propertyNameQuestions].map(
          q => q.systemName ? q.title + ` (${q.systemName})` : q.title
        ),
        agreements: res.dataAgreements || [],
        task: res
      });
    });    
  }

}


export default InteractiveDataStatistics
