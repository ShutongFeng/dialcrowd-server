import React from 'react'
import { Layout, Menu } from 'antd'
import {
  HomeOutlined, PlusCircleOutlined, MessageOutlined, SelectOutlined,
  TagsOutlined, SafetyOutlined, BookOutlined, QuestionCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { SubMenu } = Menu;

class Sider extends React.Component {
  constructor(props) {
    super(props)

    this.navItems1 = [
      { to: "/", title: "Home", icon: <HomeOutlined /> },
      { to: "/system", title: "Add System", icon: <PlusCircleOutlined /> }
    ];

    this.navItems2 = [
      { to: "/interactive_project", title: "Interaction", icon: <MessageOutlined /> },
      { to: "/category_project", title: "Intent Classification", icon: <SelectOutlined /> },
      { to: "/sequence_project", title: "Entity Classification", icon: <TagsOutlined /> },
      { to: "/quality_project", title: "Quality Annotation", icon: <SafetyOutlined /> }
    ];

    this.navItems3 = [
      // {to: "/crowd", title: "Workers", icon: "global"},
      { to: "/resources", title: "Resources", icon: <BookOutlined /> },
      { to: "/walkthrough", title: "Walkthrough", icon: <QuestionCircleOutlined /> }
    ];
  }

  render() {
    return <Layout.Sider
      trigger={null}
      collapsible
      collapsed={this.props.collapsed}
      width="225px"
    >
      <div className="logo">
        <p style={{ "color": "#afb6bc", "margin": "10px", "textAlign": "center" }}></p>
      </div>

      <Menu
        mode="inline"
        theme="dark"
        style={{ lineHeight: '64px' }}
        defaultSelectedKeys={[this.props.selectedKey]}
      >
        {
          this.navItems1.map(({ to, title, icon }) =>
            <Menu.Item
              key={to}
              style={{ fontSize: 16 }}>
              <Link
                to={to}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <span> {icon} {title}</span>
              </Link>
            </Menu.Item>
          )
        }
        <SubMenu key="template" title={<div><FileTextOutlined style={{ fontSize: 20 }} />
          <span>Task Templates</span></div>}>
          {
            this.navItems2.map(({ to, title, icon }) =>
              <Menu.Item
                key={to}
                style={{ fontSize: 16 }}>
                <Link
                  to={to}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <span>{icon} {title}</span>
                </Link>
              </Menu.Item>
            )
          }
        </SubMenu>
        {
          this.navItems3.map(({ to, title, icon }) =>
            <Menu.Item
              key={to}
              style={{ fontSize: 16 }}>

              <Link
                to={to}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <span>{icon} {title}</span>
              </Link>
            </Menu.Item>
          )
        }
      </Menu>
    </Layout.Sider>
  }
}

export default Sider