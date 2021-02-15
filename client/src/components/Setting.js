import React from "react";
import { Button, Popconfirm, } from 'antd'
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons"
import { saveAs } from 'file-saver';


class Setting extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogs: [] }
  }

  render() {
    return <div>
      <Button
        style={{ width: '90%' }}
        onClick={() => {
          var blob = new Blob(
            [JSON.stringify(this.props.editObj, null, 2)],
            { type: 'text/plain;charset=utf-8' },
          )
          saveAs(blob, "setting.json")
        }}
      >
        <DownloadOutlined /> Download Project
      </Button>
      <FileReaderInput
        as='text'
        onChange={(e, results) => this.handleFileInputChange(e, results)}
      >
        <Button
          style={{ width: '90%' }}>
          <UploadOutlined />Upload Project
        </Button>

      </FileReaderInput>
      <Popconfirm title="Are you sure delete this project?" onConfirm={() => deleteProject(this)} okText="Yes"
        cancelText="No">
        <Button
          style={{ width: '90%' }}
        >
          <DeleteOutlined /> Delete this project
        </Button>
      </Popconfirm></div>
  }
}

export default Setting