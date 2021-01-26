import {call, fork, put, takeEvery,} from 'redux-saga/effects';
import axios from 'axios';

import {addMessage} from '../actions/messageActions';
import {speak} from '../util/speechPromises';
import {serverUrl} from "../configs";

export default function* messagesSaga(sessionData, sid, synth) {
  try{
    const response = yield call(
      axios.post,
      serverUrl + "/api/router/chat/join",
      {
        sid: sid,
      }
    );
    if (response.data.action == "status"){
      yield put(addMessage(response.data.msg, Date.now(), true));
      console.log('SENT STATUS');
    }
  }
  catch(error){
    console.log(error);
  } 
  yield takeEvery('MESSAGE_SEND', sendMessageSaga, synth, sessionData);
  yield takeEvery('FEEDBACK_SEND', sendFeedbackSaga, sessionData);
}

function* receiveMessageSaga(synth, sessionData, messageData) {
  const message = messageData.msg;
  console.log(messageData);
  console.log(messageData.display === "");

  let display_messages = (messageData.display === "") ? messageData.msg : messageData.display;

  console.log(display_messages)
  yield put(addMessage(display_messages, Date.now(), true));
  const utterance = new SpeechSynthesisUtterance(message.replace("<p>", "..."));
  yield fork(logMessage, sessionData, message, "Bot")
  if(sessionData.mode !== 'text') {
    yield call(speak, synth, utterance);
  }
  if(sessionData.mode === 'continuous') {
    yield put({ type: 'MICROPHONE_START' })
  }
}

function* sendMessageSaga(synth, data, action) {
  console.log("data: ",data);
  console.log("action: ",action);
  yield put(addMessage(action.text, action.time, false));
  try{
    const response = yield call(
      axios.post,
      serverUrl + "/api/router/chat/usr_input",
      {
        msg: action.text,
        sid: data.sid,
        userId: data.userId
      }
    );
    console.log(response);
    yield call(receiveMessageSaga, synth, data, response.data);
  }
  catch(error){
    console.log(error);
  }
  yield fork(logMessage, data, action.text, "You")
}

function* logMessage(data, text, role) {
  try {
    const response = yield call(
        axios.post,
        serverUrl+'/api/dialog_save',
        {
          subId: data.subId,
          userID: data.userId,
          name_of_dialog: data.nameOfDialog,
          role: role,
          utter: text,
        })
    console.log(response)
  }
  catch(error) {
    console.log(error)
  }
}

function* sendFeedbackSaga(data, action) {
  try {
    yield call(
        axios.post,
        serverUrl+'/api/feedback',
        {
          subId: data.subId,
          userID: data.userId,
          name_of_dialog: data.nameOfDialog,
          utter: action.text,
          feedback: action.feedback,
        }
    )
  }
  catch(error) {

  }
}