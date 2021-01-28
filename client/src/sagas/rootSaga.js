import { all, call, put, takeEvery, } from 'redux-saga/effects';

import queryString from 'query-string';

import microphoneSaga from './microphoneSaga';
import messagesSaga from './messagesSaga';

import axios from 'axios';
import { serverUrl } from '../configs'

export default function* rootSaga() {
  yield newSystem(); //
  yield newDataQuery("interactive");
  yield newDataQuery("category");
  yield newDataQuery("sequence");
  yield newDataQuery("quality");
  yield takeEvery('NEW_SESSION', newSession);
  yield takeEvery('NEW_SYSTEM', newSystem);
  yield takeEvery('DELETE_PROJECT', deleteProject);
  yield takeEvery('GET_RESULT', getResult);
  yield takeEvery('DELETE_RESULT', deleteResult);
  yield takeEvery('NEW_PROJECT_DATA', newDataQuery);
  yield takeEvery('COM_ALL', combineData);
  yield takeEvery('SET_INTERACTIVE', setInteractive);


  /* Chatbox*/
  const params = queryString.parse(window.location.search);
  if (params.option) {
    const option = params.option === "continuous" ? "speech" : params.option;
    yield put({ type: 'MODE_CHANGE', mode: option })
  }
  if (params.help) {
    yield put({ type: 'HELP_UPDATE', text: params.help })
  }

  const sid = Date.now() + "\t" + (params.ip || "");
  console.log("rootSaga", params)

  const sessionData = {
    sid,
    userId: params.userID || "notProvided",
    subId: params.subId || "notProvided",
    nameOfDialog: params.name_of_dialog || "notProvided",
    taskID: params.taskID || "notProvided",
    mode: params.option,
  };

  const synth = window.speechSynthesis;

  yield all([
    call(messagesSaga, sessionData, sid, synth),
    call(microphoneSaga, synth)
  ])

}

function* setInteractive(action) {
  yield put({ type: 'SESSION_INTERACTIVE_UPDATE', interactive: action.data });

}
function* combineData(action) {
  yield put({ type: 'ALL', all: action.List });
}

function* newSession(action) {
  try {
    const response = yield call(
      axios.post,
      serverUrl + '/api/' + action.url + '/' + action.createdAt,
      {
        password: action.password,
      });
    yield put({ type: 'SESSION_' + action.url.toString().toUpperCase() + '_UPDATE', [action.url]: response.data });
  }
  catch (error) {
    console.log(error)
  }
}

function* newSystem() {
  try {
    const response = yield call(
      axios.get,
      serverUrl + '/api/get/systems');
    yield put({ type: 'UPDATE_SYSTEM', system: response.data });
  }
  catch (error) {
    console.log(error)
  }
}

function* newDataQuery(task_type) {
  if (typeof task_type === "object") {
    task_type = task_type["task_type"];
  }

  try {
    const response = yield call(
      axios.get,
      serverUrl + '/api/' + task_type);
    yield put({ type: 'UPDATE_' + task_type.toUpperCase(), [task_type]: response.data["response"] });
  }
  catch (error) {
    console.log(error);
  }
}

function* deleteProject(action) {
  console.log("deleteProject");
  try {
    yield call(
      axios.post,
      serverUrl + '/api/delete/' + action.task_type + "/" + action.task_id,
      { password: action.password }
    );
    yield newDataQuery(action.task_type)
  }
  catch (error) {
    console.log(error);
  }
}


function* deleteResult(action) {
  console.log("deleteResult");
  try {
    yield call(
      axios.get,
      serverUrl + '/api/delete/result/' + action.task_type + "/" + action.submit_id);
    yield getResult(action)
  }
  catch (error) {
    console.log(error);
  }
}

function* getResult(action) {
  console.log("task_type");
  try {
    const response = yield call(
      axios.get,
      serverUrl + '/api/get/result/' + action.task_type + "/" + action.task_id);
    yield put({ type: 'UPDATE_RESULT', dialog: response.data["dialog"], survey: response.data["survey"] });
  }
  catch (error) {
    console.log(error);
  }
}

