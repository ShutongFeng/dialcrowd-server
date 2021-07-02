import { call, fork, put, takeEvery, } from 'redux-saga/effects';
import axios from 'axios';

import { addMessage } from '../actions/messageActions';
import { speak } from '../util/speechPromises';
import { serverUrl } from "../configs";

export default function* messagesSaga(sessionData, sid, synth) {
  try {
      yield put(addMessage("Connecting to the dialogue system. Please wait for the system response.", Date.now(), true));

      const response = yield call(
      axios.post,
      serverUrl + "/api/router/chat/join",
      {
        sid: sid,
      }
    );

    // console.log("HERE is the response ")
    // console.log(response)

    if (response.data.action == "status") {
        if(!response.data.msg.includes("START"))
            yield put(addMessage(response.data.msg, Date.now(), true));
        else{

            // let data = response.data
            //
            // data.sid = sid
            // console.log("DATA?")
            // console.log(data)
            // yield call(sendMessageSaga, synth, data, "START");

            // print("DATA")
            // try {
            //     const response = yield call(
            //         axios.post,
            //         serverUrl + "/api/router/chat/usr_input",
            //         {
            //             msg: "START",
            //             sid: sid,
            //         }
            //     );
            //     console.log("sendMessageSaga response START SESSION", response);
            //     // yield call(receiveMessageSaga, synth, data, response.data);
            // }
            // catch (error) {
            //     console.log(error);
            // }

        }
      console.log('SENT STATUS');
      // TODO send message to server
    }
  }
  catch (error) {
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
  if (display_messages === undefined) {
    // TODO need to solve!!!
    display_messages = "Please type or say START to begin.";
    // return;    
  }
  yield put(addMessage(display_messages, Date.now(), true));
  const utterance = new SpeechSynthesisUtterance(message.replace("<p>", "..."));
  yield fork(logMessage, sessionData, message, "Bot")
  if (sessionData.mode !== 'text') {
      // TODO: I disabled the speech.
      //yield call(speak, synth, utterance);
  }
  if (sessionData.mode === 'continuous') {
    yield put({ type: 'MICROPHONE_START' })
  }
}

function* sendMessageSaga(synth, data, action) {
  console.log("data: ", data);
  console.log("action: ", action);
  yield put(addMessage(action.text, action.time, false));
  try {
    const response = yield call(
      axios.post,
      serverUrl + "/api/router/chat/usr_input",
      {
        msg: action.text,
        sid: data.sid,
        userId: data.userId,
        taskID: data.taskID
      }
    );
    console.log("sendMessageSaga response", response);
    yield call(receiveMessageSaga, synth, data, response.data);
  }
  catch (error) {
    console.log(error);
  }
  yield fork(logMessage, data, action.text, "You")
}

function* logMessage(data, text, role) {
  try {
    const response = yield call(
      axios.post,
      serverUrl + '/api/dialog_save',
      {
        subId: data.subId,
        userID: data.userId,
        name_of_dialog: data.nameOfDialog,
        role: role,
        utter: text,
        taskID: data.taskID
      })
    console.log("logMessage", response)
    console.log("logMessage data", data)

  }
  catch (error) {
    console.log(error)
  }
}

function* sendFeedbackSaga(data, action) {
  try {
    yield call(
      axios.post,
      serverUrl + '/api/feedback',
      {
        subId: data.subId,
        userID: data.userId,
        name_of_dialog: data.nameOfDialog,
        utter: action.text,
        feedback: action.feedback,
      }
    )
  }
  catch (error) {

  }
}
