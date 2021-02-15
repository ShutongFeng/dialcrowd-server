import React from "react";
import { Button, Divider, Drawer, Input, message, Popconfirm, Table } from 'antd';
import { connect } from "react-redux";
import Highlighter from 'react-highlight-words';
import { SearchOutlined, GithubOutlined, EditOutlined, MessageOutlined, FolderAddOutlined } from '@ant-design/icons';
import NewSystem from "./NewSystem";
import HelpConnectSystem from "./help/HelpConnectSystem";
import Iframe from 'react-iframe'
import { Form } from "antd/lib/index";
import { clientUrl, serverUrl } from '../configs'
import { newSystem } from '../actions/systemActions';

function Submit(t, data, id) {
  console.log(serverUrl)
  fetch(serverUrl + '/api/save/system/' + id, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.message === "success") {
        message.success("Success");
        t.props.newSystem();
      }
      else {
        message.success("Fail");
      }
    });
}


class AddSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, configure_visible: false, url: "", data: {}, inputText: "" }
  }

  showbotconfigure = () => {
    this.setState({
      data: {},
      configure_visible: true,
    });
    this.props.form.resetFields();
  };

  showDrawer = (url) => {
    console.log(url);

    let urls = clientUrl + "/chat?userID=dialCrowd_Testing&subId=DialCrowd_subjectId&option=both&ip=" + url;
    this.setState({
      visible: true,
      url: urls,
    });

  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  onConfigureClose = () => {
    this.setState({
      configure_visible: false,
    });
  };

  editConfig = (x) => {
    console.log(x);
    this.props.form.resetFields();
    this.setState({
      data: x, configure_visible: true,
    });
  }
  onChangeInput = (e) => {
    this.setState({ inputText: e.target.value });
  };
  confirm = (e) => {
    console.log(e);
    if (e["password"] === this.state.inputText) {
      this.setState({ inputText: "" });
      this.props.form.resetFields();
      this.setState({
        data: e, configure_visible: true,
      });
    }
    else {
      message.error('Please check your password or contact: linh@hhu.de');
      this.setState({ inputText: "" });
    }
  }

  cancel = (e) => {
    console.log(e);
    this.setState({ inputText: "" });
  }


  submit = (x) => {
    x.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        if (this.state.data._id) {
          Submit(this, values, this.state.data._id);
        }
        else {
          Submit(this, values, "new");
        }
        this.onConfigureClose();
      }
    });

  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={dataIndex !== 'nickname' ? `Search project` : `Search creator`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
          text
        ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  render() {
    // preemptively sort the table
    if (this.props.system.length > 0) {
      this.props.system.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      })
    }

    const columns = [{
      title: 'System Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      ...this.getColumnSearchProps('name'),
    }, {
      title: 'Organization',
      dataIndex: 'org',
      key: 'org',
      width: '20%',
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      ...this.getColumnSearchProps('name'),
    }, {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
    }, {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '15%'

    },
    {
      title: '',
      key: 'action',
      width: '15%',
      render: (text, record) => (
        <span>
          <Button shape={"circle"} disabled={!record.github}>
            <a href={record.github} target={"_blank"}><GithubOutlined /></a>
          </Button>
          <Divider type="vertical" />
          <Popconfirm title={
            <span>
              <h3>Password</h3>
              <p>"Please type in the password of this system"</p>
              <Input
                placeholder="Password"
                value={this.state.inputText}
                onChange={this.onChangeInput}
              />
            </span>} onConfirm={() => this.confirm(record)} onCancel={this.cancel} okText="Yes" cancelText="No">
            <Button shape={"circle"}><EditOutlined /></Button>
          </Popconfirm>
          <Divider type="vertical" />
          <Button shape={"circle"} onClick={() => this.showDrawer(record.url)}>
            <MessageOutlined />
          </Button>
        </span>
      ),
    }];

    return <div>
      <h1> Dialog Systems for Testing</h1>
      <Drawer
        placement="right"
        width={720}
        closable={false}
        onClose={this.onClose}
        visible={this.state.visible}
      >
        <Iframe style={{ "margin-right": "10px" }} url={this.state.url}
          width="90%"
          height="700px"
          display="initial"
          position="relative"
          allowFullScreen />
      </Drawer>
      <div style={{ display: "flex" }}>
        <Button onClick={this.showbotconfigure}>
          <FolderAddOutlined />Create
        </Button>

        <HelpConnectSystem />
      </div>
      <NewSystem
        visible={this.state.configure_visible}
        onClose={this.onConfigureClose}
        data={this.state.data}
        submit={this.submit}
        form={this.props.form}
      />
      <Table rowKey={"_id"} columns={columns} bordered dataSource={this.props.system} />

    </div>
  }
}

function mapStateToProps(state) {
  return {
    system: state.system,
  }
}


const mapDispatchToProps = {
  newSystem: newSystem,
};

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(AddSystem));
