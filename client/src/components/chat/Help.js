import React from "react";
import { connect } from "react-redux";
import { AntDesignOutlined, DownOutlined } from "@ant-design/icons";
import { Motion, spring } from "react-motion";
import { Row, Col, Card } from "antd";

class Help extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  render() {
    return (
      <Motion style={{ height: spring(this.state.open ? 560 : 0) }}>
        {({ height }) => (
          <div className="help" style={{ height: height + 54 }}>
            {height > 0 ? (
              // <div className="helpText">{_renderTasks(this.props)}</div>
              <div className="helpText">{_renderTasks(this.props.text)}</div>
            ) : null}
            <div className="helpHeader" onClick={this.toggleOpen.bind(this)}>
              <span className="helpTitle">Help Page</span>
              <div
                className="helpIcon"
                style={{ transform: `rotate(${height / 2}deg)` }}
              >
                <DownOutlined />
              </div>
            </div>
          </div>
        )}
      </Motion>
    );
  }

  toggleOpen() {
    this.setState({
      open: !this.state.open,
    });
  }
}

function _renderCardName(cardName, item) {
  if (item.length > 0) {
    return (
      <p>
        <b>{cardName}</b>
      </p>
    );
  }
}
function _renderCardItems(item) {
  if (item.length > 0) {
    return item.split(",").map((x) => <p>{x}</p>);
  }
}
function _renderTasks(taskStr) {
  let rawTask = JSON.parse(taskStr);
  let taskList = rawTask.tasks;
  return (
    <div style={{ background: "#ECECEC", padding: "30px" }}>
      <Row gutter={16}>
        {taskList.map((item) => (
          <Col span={12}>
            <Card
              title={item.Dom}
              bordered={false}
              headStyle={{ size: 30, "text-align": "center" }}
              bodyStyle={{ size: 20, "text-align": "center" }}
            >
              {_renderCardName("Condition", item.Cons)}
              {_renderCardItems(item.Cons)}
              <p></p>
              {_renderCardName("Please Book", item.Book)}
              {_renderCardItems(item.Book)}
              <p></p>
              {_renderCardName("Please Ask", item.Reqs)}
              {_renderCardItems(item.Reqs)}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    text: state.help,
  };
}

export default connect(mapStateToProps)(Help);
