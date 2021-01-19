export function sendMessage(text, task_id, time, role, worker_id, terminal, sessionId, slots) {
  return {
    type: 'MESSAGE_SEND',
    task_id,
    text,
    time,
    role,
    worker_id,
    terminal,
    sessionId,
    slots,
  }
}

export function newMessage() {
  return {type: "MESSAGE_NEW"}
}

export function addMessage(text, time, received, image) {
  return {
    type: 'MESSAGE_ADD',
    text,
    time,
    received,
    image,
  }
}

export function sendFeedback(text, time, feedback) {
  return {
    type: 'FEEDBACK_SEND',
    text,
    time,
    feedback,
  }
}