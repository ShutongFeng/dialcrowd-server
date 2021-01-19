import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import registerServiceWorker from './registerServiceWorker';
import './styles/index.css';
import './styles/index.less';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import configureStore from './store/configureStore.js'
import Layout from './components/Layout';
import 'antd/dist/antd.css'
import WorkerInteractive from './components/workers/WorkerInteractive.js';
import WorkerCategory from './components/workers/WorkerCategory.js';
import WorkerSequence from './components/workers/WorkerSequence.js';
import WorkerQuality from './components/workers/WorkerQuality.js';
import Chat from './components/chat/Chat.js';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-63929316-3');
ReactGA.pageview(window.location.pathname + window.location.search);


const store = configureStore();

store.runSaga();

ReactDOM.render(
  <Provider store={store}>
    <Router
      getUserConfirmation={(message, callback) => {
        callback(window.confirm(message))
      }}
    >
      <Switch>
        <Route path="/worker_interactive" component={WorkerInteractive}/>
        <Route path="/worker_category" component={WorkerCategory}/>
        <Route path="/worker_sequence" component={WorkerSequence}/>
        <Route path="/worker_quality" component={WorkerQuality}/>
        <Route path="/chat" component={Chat}/>
        <Route path="/" component={Layout}/>
      </Switch>
    </Router>

  </Provider>,
  document.getElementById('root'));

registerServiceWorker();
