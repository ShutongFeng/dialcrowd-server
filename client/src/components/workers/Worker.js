import React from "react";
import {connect} from "react-redux";
import {Button, Input, Modal, Popconfirm, Table} from 'antd';
import Highlighter from 'react-highlight-words';
import {SearchOutlined} from '@ant-design/icons';
import {clientUrl} from "../../configs.js";
import {combine_data} from "../../actions/crowdAction";

const confirm = Modal.confirm;


class Worker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: [],inputText:"", visible:false, ID:"",MID:"",type:""}
  }

  componentDidMount() {
    this.init();
  }
  init = () =>
  {
    this.props.combine_data(this.props.interactive,this.props.category,this.props.sequence,this.props.quality);
  }

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onChangeInput = (e) => {
    this.setState({inputText: e.target.value});
  };

  confirm = (e) =>
  {
    // _id is the id of the task, type is the type of the task, MID is the worker username
    console.log(e);
    this.setState({
      MID: this.state.inputText,
      ID: e["_id"],
      type: e["type"],
      visible: true,
    })
    if (this.state.inputText !== "") {
      let url = clientUrl + "/worker_" + e["type"] + "/?ID=" + e["_id"] + "&MID=" + this.state.inputText;
      window.open(url);
    }
    else
    {
      confirm({
        title: 'Error!',
        content: 'Please Input your name',
        onOk() {
        },
        onCancel() {
        },
      });
    }
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={dataIndex !== 'nickname' ? `Search project`: `Search creator`}
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
    if (this.props.all.length > 0){
      this.props.all.sort(function(a, b){
        return a.project.localeCompare(b.project);
      })
    }
    const columns = [
      { title: 'Title', dataIndex: 'project', key: 'project', 
        sorter: (a, b) => {
          return a.name.localeCompare(b.name);
        },
        ...this.getColumnSearchProps('name'),
       },
      { title: 'Requester', dataIndex: 'user', key: 'user',
        sorter: (a, b) => {
          return a.name.localeCompare(b.name);
        },
        ...this.getColumnSearchProps('name'), 
      },
      { title: 'Type', dataIndex: 'type', key: 'type' },
      { title: 'Action', dataIndex: '', key: 'x', render: (record) =>
            <Popconfirm title={
            <span>
                  <h1>Do you want to work on this HIT?</h1>
                  <p>"Please type the user name"</p>
                <Input
                    placeholder="User Name"
                    value={this.state.inputText}
                    onChange={this.onChangeInput}
                />
              </span>
            } onConfirm={() => this.confirm(record)} onCancel={this.cancel} okText="Yes" cancelText="No"><a>Accept & Work</a></Popconfirm> },
    ];
    return <div>
      <h1> All Public HITs </h1>
      <Button onClick={this.init}> Refresh</Button>
      <br></br>
      <br></br>
      <Table
          rowKey={"_id"}
          columns={columns}
          bordered
          expandedRowRender={record => <div><h4>Background</h4><p style={{margin: 0}}>{record.generic_introduction}</p>
            <p></p><h4>Instructions</h4><p style={{margin: 0}}>{record.generic_instructions}</p></div>}
          dataSource={this.props.all}
      />

    </div>
  }
}

function mapStateToProps(state) {
  return {
    interactive: state.interactive,
    sequence: state.sequence,
    category: state.category,
    quality: state.quality,
    all: state.all
  }
}


const mapDispatchToProps = {
  combine_data:combine_data,
};

export default connect(mapStateToProps, mapDispatchToProps)(Worker);
