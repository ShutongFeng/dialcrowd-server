import React, { Component } from 'react'
import { Table } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

class DataStatistics extends Component {
  /* Props:
   * {@String} url: Url from which statistics can be fetched.
   * {@String} urlResults: Url from which results can be fetched.
   * {@Array} questions: Array of questions. `propertyNameQuestions` 
   * is used only when this prop is not given.
   * {@String} propertyNameQuestions: Name of the question list, e.g. questionSurveys.
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
  static subColumns = [
    {
      title: 'Response',
      dataIndex: 'response',
      key: 'response'
    },
    {
      title: "Cohen's Kappa",
      dataIndex: "Cohen's Kappa",
      key: "Cohen's Kappa"
    }
  ];
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      agreements: [],
    };
  }

  componentDidMount() {
    this.getResults();
    this.getStatistics();
    setInterval(() => this.getStatistics(), 5000);
    setInterval(() => this.getResults(), 5000);
  }

  getStatistics() {
    /* Retrieve dataAgreements. */
    fetch(this.props.url).then(res => res.json()).then(res => {
      this.setState({
        questions: this.props.questions || res[this.props.propertyNameQuestions].map(q => q.title),
        agreements: res.dataAgreements || [],
        task: res
      });
    });
  }

  getResults() {
    /* Retrieve agreements for each individual task unit. */
    fetch(this.props.urlResult).then(res => res.json()).then(res => {
      this.setState({
        result: res
      });
    });
  }

  makeDataSource() {
    if (this.state.task === undefined) {
      return undefined;
    }

    // calculate mean of each agreement metric
    let mean = {};
    let dataSource = [];
    if (this.state.agreements) {
      for (const metric in this.state.agreements[0]) {
        mean[metric] = (this.state.agreements.map(x => x[metric]).reduce(
          (a, b) => (a + b), 0
        ) / this.state.agreements.length).toFixed(3);
      }

      // prepare data to show
      dataSource = this.state.agreements.map(
        (agree, index) => {
          // Convert to fixed-point strings.
          let fixedAgree = {};
          for (const [metric, value] of Object.entries(agree)) {
            if (value === null) {
              fixedAgree[metric] = '-';
            } else {
              fixedAgree[metric] = value.toFixed(3);
            }
          }
          return {
            question: this.state.questions[index],
            units: this.makeSubDataSource(index),
            ...fixedAgree
          };
        }
      );

      // Append mean to the last row.
      if (dataSource.length > 1) {
        dataSource.push({ ...mean, question: <b>Average</b> });
      }
    }
    return dataSource;
  }

  makeSubDataSource(indexQuestion) {
    if (this.state.task === undefined || this.state.result === undefined) {
      return undefined;
    }
    let id2Unit = {};
    for (const unit of this.state.task.units) {
      id2Unit[unit.id] = unit;
    }
    let dataSource = [];
    for (const [idUnit, unit] of Object.entries(this.state.result.unit)) {
      if (id2Unit[idUnit] === undefined) { continue; }
      let agreements = { ...unit.agreements[indexQuestion] };
      for (const metric in agreements) {
        if (agreements[metric] === null) {
          agreements[metric] = '-';
        } else {
          agreements[metric] = agreements[metric].toFixed(2);
        }
      }
      let entry = { ...agreements, ...id2Unit[idUnit] };
      dataSource.push(entry);
    }
    return dataSource;
  }

  render() {
    const { columns, subColumns } = this.constructor;
    const dataSource = this.makeDataSource();
    const expandedRowRender = (
      // For interactive task, where subcolumns won't be given.
      subColumns === undefined ?
        undefined
        : record => <Table dataSource={record.units} columns={subColumns}
          pagination={{ hideOnSinglePage: true }} />
    );
    const expandIcon = ({ expanded, onExpand, record }) => {
      // Make the Average row not expandable.
      if (record.units !== undefined) {
        return expanded ? (
          <MinusSquareOutlined onClick={e => onExpand(record, e)} />
        ) : (
            <PlusSquareOutlined onClick={e => onExpand(record, e)} />
          )
      } else {
        return undefined;
      }
    }

    const hasCohensKappa = columns.map(c => c.title).indexOf("Cohen's Kappa") != -1;
    return (<>
      <Table dataSource={dataSource} columns={columns}
        expandedRowRender={expandedRowRender}
        expandIcon={expandIcon}
        pagination={{ hideOnSinglePage: true }}
      />
      <br />
      {hasCohensKappa ? this.showCohensColorCode() : null}
    </>);
  }

  showCohensColorCode() {
    return (<>
      <div> Cohen's Kappa indicates worker agreement of different levels:
        <ul>
          <li> <span style={{ color: "#595959", "font-weight": "bold" }}> {"< 0.00"} </span> : Poor </li>
          <li> <span style={{ color: "#940004", "font-weight": "bold" }}> 0.00 - 0.20 </span> : Slight </li>
          <li> <span style={{ color: "#d15700", "font-weight": "bold" }}> 0.20 - 0.40 </span> : Fair </li>
          <li> <span style={{ color: "#e6b314", "font-weight": "bold" }}> 0.40 - 0.60 </span> : Moderate </li>
          <li> <span style={{ color: "#90ad00", "font-weight": "bold" }}> 0.60 - 0.80 </span> : Substantial </li>
          <li> <span style={{ color: "#00b31a", "font-weight": "bold" }}> 0.80 - 1.00 </span> : Almost Perfect </li>
        </ul>
      </div>
    </>);
  }
}

function renderWithColor(score) {
  let color;
  score = parseFloat(score);
  if (score < 0 || isNaN(score)) { color = '#595959'; }
  else if (score < 0.2) { color = '#940004'; }
  else if (score < 0.4) { color = '#d15700'; }
  else if (score < 0.6) { color = '#e6b314'; }
  else if (score < 0.8) { color = '#90ad00'; }
  else { color = '#00b31a'; }
  return {
    props: {},
    children: <span style={{ color: color, "font-weight": "bold" }}> {score} </span>
  };
}


export default DataStatistics;
export { renderWithColor };
