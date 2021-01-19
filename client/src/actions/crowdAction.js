export function deleteProject(task_type, task_id, password) {
  return {
    type: 'DELETE_PROJECT',
    task_type,
    task_id,
    password
  }
}

export function getResult(task_type,task_id) {
  return {
    type: 'GET_RESULT',
    task_type,
    task_id
  }
}

export function deleteResult(task_type,task_id, submit_id) {
  return {
    type: 'DELETE_RESULT',
    task_type,
    task_id,
    submit_id
  }
}


export function new_project_data(task_type) {
  return {
    type: 'NEW_PROJECT_DATA',
    task_type
  }
}

export function combine_data(interactive,category,sequence,quality) {
  let List = [];
  interactive.forEach((x, _) => {
    if(x["deploy"])
      List.push({"type":"interactive", "_id": x["_id"], "generic_instructions": x["generic_instructions"],"generic_introduction": x["generic_introduction"], "project": x["name"],"user": x["nickname"]});
  });
  category.forEach((x, _) => {
    if(x["deploy"])
      List.push({"type":"category", "_id": x["_id"], "generic_instructions": x["generic_instructions"],"generic_introduction": x["generic_introduction"], "project": x["name"],"user": x["nickname"]});
  });
  sequence.forEach((x, _) => {
    if(x["deploy"])
      List.push({"type":"sequence","_id": x["_id"], "generic_instructions": x["generic_instructions"],"generic_introduction": x["generic_introduction"], "project": x["name"],"user": x["nickname"]});
  });
  quality.forEach((x, _) => {
    if(x["deploy"])
      List.push({"type":"quality", "_id": x["_id"], "generic_instructions": x["generic_instructions"], "generic_introduction": x["generic_introduction"], "project": x["name"], "user": x["nickname"]});
  });
  return {
    type: 'COM_ALL',
    List
  }
}
