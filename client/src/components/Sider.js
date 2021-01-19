import React from 'react'
import {Icon, Layout, Menu} from 'antd'
import {Link} from 'react-router-dom'

const { SubMenu } = Menu;

class Sider extends React.Component {
  constructor(props) {
    super(props)

    this.navItems1 = [
      {to: "/", title: "Home", icon: "home"},
      {to: "/system", title: "Add System", icon: "plus-circle-o"}
    ];

    this.navItems2 = [
      {to: "/interactive_project", title: "Interaction", icon: "message"},
      {to: "/category_project", title: "Intent Classification", icon: "select"},
      {to: "/sequence_project", title: "Entity Classification", icon: "tags-o"},
      {to: "/quality_project", title: "Quality Annotation", icon: "safety"}
    ];

    this.navItems3 = [
      // {to: "/crowd", title: "Workers", icon: "global"},
      {to: "/resources", title: "Resources", icon: "book"},
      {to: "/walkthrough", title: "Walkthrough", icon: "question-circle"}
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
        <p style={{"color": "#afb6bc", "margin": "10px", "textAlign": "center"}}></p>
      </div>

      <Menu
          mode="inline"
          theme="dark"
          style={{lineHeight: '64px'}}
          defaultSelectedKeys={[this.props.selectedKey]}
      >
      {
        this.navItems1.map(({to, title, icon}) =>
            <Menu.Item key={to}>
              <Link
                  to={to}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
              >
                <Icon type={icon} style={{fontSize: 20}}/>
                <span>{title}</span>
              </Link>
            </Menu.Item>
        )
      }
      <SubMenu key="template" title={<div><Icon type={"file-text"} style={{fontSize: 20}}/>
                <span>Task Templates</span></div>}>
        {
          this.navItems2.map(({to, title, icon}) =>
              <Menu.Item key={to}>
                <Link
                    to={to}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                >
                  <Icon type={icon} style={{fontSize: 20}}/>
                  <span>{title}</span>
                </Link>
              </Menu.Item>
          )
        }
      </SubMenu>
      {
        this.navItems3.map(({to, title, icon}) =>
            <Menu.Item key={to}>
              <Link
                  to={to}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
              >
                <Icon type={icon} style={{fontSize: 20}}/>
                <span>{title}</span>
              </Link>
            </Menu.Item>
        )
      }
      </Menu>
    </Layout.Sider>
  }
}

export default Sider