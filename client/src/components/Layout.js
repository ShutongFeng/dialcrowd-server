import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import { Layout as AntLayout, } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, ContactsOutlined, GitlabOutlined } from '@ant-design/icons'

import Home from './Home.js'
import Sider from './Sider.js'
import Interactive from './requesters/template/interactive/Interactive.js'
import Category from './requesters/template/category/Category.js'
import Sequence from './requesters/template/sequence/Sequence.js'
import Quality from './requesters/template/quality/Quality.js'
import InteractiveProject from './requesters/template/interactive/InteractiveProject.js'
import CategoryProject from "./requesters/template/category/CategoryProject"
import SequenceProject from "./requesters/template/sequence/SequenceProject.js"
import QualityProject from "./requesters/template/quality/QualityProject.js"
import Worker from "./workers/Worker"
import AddSystem from "./AddSystem.js"
import People from './People.js';
import Cluster from './ml/cluster.js'
import Resources from './Resources.js'
import Walkthrough from './Walkthrough.js'

class Layout extends React.Component {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    return <AntLayout style={{ height: '100%', minHeight: '100vh' }}>
      <Sider collapsed={this.state.collapsed}
      />
      <AntLayout>
        <AntLayout.Header style={{ background: '#f0f2f5', padding: 0 }}>
          {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            style: { marginLeft: "10px", fontSize: 20 },
            onClick: this.toggle,
          })}
          <div key="logo" style={{ float: "right", "marginRight": "20px" }}>
            <Link to="/">
              <img width={"100px"} src={"http://dialrc.org/img/site-logo.png"} alt="logo" />
            </Link>
          </div>
        </AntLayout.Header>
        <AntLayout.Content style={{
          flex: 1,
          flexDirection: 'column',
          overflow: 'scroll',
          background: '#fff',
          padding: 24
        }}>
          <Switch>
            <Route path="/interactive" component={Interactive} />
            <Route path="/category" component={Category} />
            <Route path="/sequence" component={Sequence} />
            <Route path="/quality" component={Quality} />
            <Route path="/interactive_project" component={InteractiveProject} />
            <Route path="/category_project" component={CategoryProject} />
            <Route path="/sequence_project" component={SequenceProject} />
            <Route path="/quality_project" component={QualityProject} />
            <Route path="/system" component={AddSystem} />
            <Route path="/people" component={People} />
            <Route path="/crowd" component={Worker} />
            <Route path="/cluster" component={Cluster} />
            <Route path="/resources" component={Resources} />
            <Route path="/walkthrough" component={Walkthrough} />
            <Route path="/" component={Home} />
          </Switch>
        </AntLayout.Content>

        <AntLayout.Footer style={{}}>
          <strong>Copyright © 2020, DialRC, Carnegie Mellon University</strong>
          <div style={{ float: "right", "marginRight": "10px" }}>
            <a href={"mailto:dialog-evaluation@hhu.de"}>
              <ContactsOutlined
                style={{ fontSize: 20 }} /></a>
            <a href={"https://gitlab.cs.uni-duesseldorf.de/dsml/project/dialogevaluation/dialcrowdv2"}>
              <GitlabOutlined
                style={{ fontSize: 20 }} /></a>
          </div>
        </AntLayout.Footer>
      </AntLayout>
    </AntLayout>
  }
}

export default Layout