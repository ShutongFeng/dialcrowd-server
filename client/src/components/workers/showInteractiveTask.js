import { Row, Col, Popover, Button } from "antd";

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

function _domainTask(item) {
  return (
    <Popover
      content={_buttonContent(item)}
      title={item.Dom}
      trigger="click"
      placement="bottomLeft"
    >
      <Button>{item.Dom}</Button>
    </Popover>
  );
}

function _buttonContent(item) {
  return (
    <div style={{ "text-align": "center" }}>
      {_renderCardName("Condition", item.Cons)}
      {_renderCardItems(item.Cons)}
      <p></p>
      {_renderCardName("Please Book", item.Book)}
      {_renderCardItems(item.Book)}
      <p></p>
      {_renderCardName("Please Ask", item.Reqs)}
      {_renderCardItems(item.Reqs)}
    </div>
  );
}

function renderTasksButton(taskList) {
  return (
    <div style={{ background: "#ECECEC", padding: "10px" }}>
      <p>You can click the domain to see the detail of the dialogue task.</p>
      <Col>{taskList.map((item) => _domainTask(item))}</Col>
    </div>
  );
}
export { renderTasksButton };
