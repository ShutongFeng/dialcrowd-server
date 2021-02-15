import React from "react";
import { Button, Divider, Input, message, Modal, Popconfirm, Spin, Table } from 'antd';
import { connect } from 'react-redux';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { serverUrl } from "../configs"
import { loadData } from "../actions/sessionActions";
import { deleteProject } from "../actions/crowdAction";
import { Form } from "antd/lib/index";

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Status: "None",
      isload: false,
      loading: false,
      visible: false,
      background: "",
      instruction: "",
      password: "",
      createdAt: "",
      sysA: "",
      inputText: ""
    }
  }

  handleOk = () => {
    this.visit();
  }

  async visit() {
    const url = serverUrl + '/api/' + this.props.url + '/' + this.state.createdAt;
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: this.state.password })
    });
    const response = await rawResponse.json();
    // `response` will be null if the password is incorrect.
    if (response !== null) {
      response.password = this.state.password;
      await this.props.dispatchUpdate(this.props.url, response);
      // hide modal
      this.setState({ loading: false, visible: false, password: "" });
      // navigate to the config page
      this.props.history.replace('/' + this.props.url);
    } else {
      message.error('Please check the password!');
    }
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  async go(createdAt) {
    this.setState({ visible: true, createdAt: createdAt });
  }


  onChangePassword = (e) => {
    this.setState({ password: e.target.value });
  }

  confirm = (e) => {
    if (e["password"] === this.state.inputText || true) {
      message.success('Delete Success');
      this.props.deleteProject(this.props.url, e["_id"], this.state.inputText);
      this.setState({ inputText: "" });
    }
    else {
      message.error('Please check your password or contact: kyusongleegmail.com');
      this.setState({ inputText: "" });
    }
  }

  cancel = (e) => {
    this.setState({ inputText: "" });
  }
  onChangeInput = (e) => {
    this.setState({ inputText: e.target.value });
  };

  //https://ant.design/components/table/

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
    const { data } = this.props
    const { visible, loading } = this.state;

    // preemptively sort the table
    if (data.length > 0) {
      data.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      })
    }

    const columns = [
      {
        title: 'ID', dataIndex: 'createdAt', key: 'createdAt',
      },
      {
        title: 'Project Name', dataIndex: 'name', key: 'name',
        sorter: (a, b) => {
          return a.name.localeCompare(b.name);
        },
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Creator', dataIndex: 'nickname', key: 'nickname',
        sorter: (a, b) => {
          return a.nickname.localeCompare(b.nickname);
        },
        ...this.getColumnSearchProps('nickname'),
      },
      {
        title: 'Menu',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => (
          <span className="table-operation">
            {
              <span>
                <a onClick={() => this.go(record.createdAt)}><EditOutlined /></a>
                <Divider type="vertical" />
                <Popconfirm title={
                  <span>
                    <h1>Are you abolutely sure?</h1>
                    <p>"Please type in the password of this task to confirm."</p>
                    <Input
                      placeholder="Password"
                      value={this.state.inputText}
                      onChange={this.onChangeInput}
                    />
                  </span>} onConfirm={() => this.confirm(record)} onCancel={this.cancel} okText="Yes" cancelText="No">
                  <a><DeleteOutlined /></a>
                </Popconfirm>


              </span>
            }
          </span>
        ),
      },
    ];

    return (

      this.state.isload ?
        <Spin tip="Loading...">
          <Table
            columns={columns}
            rowKey='createdAt'
            dataSource={data}
          />
        </Spin>
        :
        <div>
          <Table
            columns={columns}
            rowKey='createdAt'
            bordered
            dataSource={data}
            size={'small'}
          />
          <Modal
            visible={visible}
            title="Enter Password"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
              <Button key="back" onClick={this.handleCancel}>Return</Button>,
              <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}> Submit</Button>,
            ]}
          >
            <Input
              type="password"
              placeholder="Enter the password"
              onChange={this.onChangePassword}
            />
          </Modal>
        </div>

    );
  }
}

function dispatchUpdate(taskType, data) {
  /* Params:
   * {@String} taskType: e.g. interactive.
   * {@Object} data: Result from POST `[serverUrl]/api/[taskType]/[idTask]`.
   */
  return {
    type: `SESSION_${taskType.toUpperCase()}_UPDATE`,
    [taskType]: data
  }
}



function mapStateToProps(state) {
  return {
    session_interactive: state.session_interactive,
    session_category: state.session_category,
    session_sequence: state.session_sequence,
    session_quality: state.session_quality,
  };
}


const mapDispatchToProps = {
  loadData: loadData,
  deleteProject: deleteProject,
  dispatchUpdate: dispatchUpdate
};


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ProjectList));

