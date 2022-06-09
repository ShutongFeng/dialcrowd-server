const express = require("express");
var Cohen = require("./Kappa.js");
const router = express.Router();
const cors = require("cors");
const path = require("path");
const mongojs = require("mongojs");
const request = require("request");
var urllib = require("urllib");
const passwordHash = require("password-hash");
const utils = require(path.join(__dirname, "../constants"));
const collections = [
  "category",
  "category_result",
  "interactive_dialog",
  "interactive_survey",
];
const db_connection = mongojs(utils.MONGODB_URL_CROWD, collections);
const category_collection = db_connection.category;
const category_resultcollection = db_connection.category_result;
const category_detail_result_collection = db_connection.detail_category;

const interactive_collection = db_connection.interactive;
const interactive_resultcollection = db_connection.interactive_dialog;
const interactive_resultsurvey = db_connection.interactive_survey;

const sequence_collection = db_connection.sequence;
const sequence_resultcollection = db_connection.sequence_result;

const systems_collection = db_connection.systems;

const quality_collection = db_connection.quality;
const quality_resultcollection = db_connection.quality_result;

const taskModelInteractive = require("./task_models/interactive_task_model.js");
const taskModelSequence = require("./task_models/sequence_task_model.js");
const taskModelCategory = require("./task_models/category_task_model.js");
const taskModelQuality = require("./task_models/quality_task_model.js");
const dialogueTest = require("./task_models/dialog_check.js");

const mapTaskModel = {
  interactive: taskModelInteractive,
  sequence: taskModelSequence,
  category: taskModelCategory,
  quality: taskModelQuality,
};

//options for cors middleware
const options = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "*",
  preflightContinue: false,
};

//use CORS middleware
router.use(cors(options));

//enable pre-flight
router.options("*", cors(options));

/***
 * Get a new context
 */

// function randomSelect(list) {
//   return list[Math.floor(Math.random() * list.length)]
// }

// function weightedChoice(array, weights) {
//   let s = weights.reduce((a, e) => a + e);
//   let r = Math.random() * s;
//   return array.find((e, i) => (r -= weights[i]) < 0);
// }

// function maxValue(data, key) {
//   let maxValue = null;
//   for (let i = 0; i < data.length; i++) {
//     if (maxValue === null || maxValue < data[i][key].length) {
//       maxValue = data[i][key].length;
//     }
//   }
//   return maxValue
// }

function timestamp() {
  return new Date().toLocaleString();
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

router.get("/task/:task_type/:task_id", function (req, res, next) {
  switch (req.params.task_type) {
    case "interactive":
      return taskModelInteractive.resGetTask(res, req.params.task_id);
    case "category":
      return taskModelCategory.resGetTask(res, req.params.task_id);
    case "sequence":
      return taskModelSequence.resGetTask(res, req.params.task_id);
    case "quality":
      return taskModelQuality.resGetTask(res, req.params.task_id);
  }
});

// Connects the correct database given by :task_type to store the results of the route in
// Return the list of projects.
router.get("/:task_type", function (req, res, next) {
  switch (req.params.task_type) {
    case "interactive":
      return taskModelInteractive.resGetProjects(res);
    case "category":
      return taskModelCategory.resGetProjects(res);
    case "sequence":
      return taskModelSequence.resGetProjects(res);
    case "quality":
      return taskModelQuality.resGetProjects(res);
  }
});

// Returns the task information with the id given by :createdAt
router.post("/:task_type/:createdAt", function (req, res, next) {
  if (!(req && req.body)) {
    return res.status(400).json({ err: "request is invalid" });
  }
  const createdAt = req.params.createdAt;
  const task_type = req.params.task_type;

  const action = req.body;

  if (!action || !createdAt) {
    return res.status(400).json({ err: "bad input parameters" });
  }
  if (!action["password"]) {
    return res.status(400).json({ err: "system response value is missing" });
  }
  const password = action.password;
  let collection;
  if (task_type === "interactive") {
    collection = interactive_collection;
  } else if (task_type === "category") {
    collection = category_collection;
  } else if (task_type === "sequence") {
    collection = sequence_collection;
  } else {
    collection = quality_collection;
  }
  collection.findOne({ createdAt: parseInt(createdAt) }, function (err, task) {
    if (err) {
      res.send(err);
    } else {
      let correct = false;
      if (!passwordHash.isHashed(task.password)) {
        correct = task.password === action.password;
      } else {
        correct = passwordHash.verify(action.password, task.password);
      }
      if (correct) {
        res.json(task);
      } else {
        res.json(null);
      }
    }
  });
});

// Gets the results of task from the specific worker with :task_id
// TODO: Hard remove this risky request
router.get("/result/:task_type/:task_id/:password", function (req, res, next) {
  const task_type = req.params.task_type;
  const task_id = req.params.task_id;
  const password = req.params.password;

  if (password !== "flyingbroom") {
    return taskModelInteractive.resGetResult(res, "602a96848af59d231cec21ee");
  }

  let collection;
  if (task_type === "interactive") {
    return taskModelInteractive.resGetResult(res, task_id);
  } else if (task_type === "category") {
    return taskModelCategory.resGetResult(res, task_id);
  } else if (task_type === "sequence") {
    return taskModelSequence.resGetResult(res, task_id);
  } else {
    return taskModelQuality.resGetResult(res, task_id);
  }
  collection.findOne({ task_id: task_id }, function (err, task) {
    if (err) {
      res.send(err);
    } else {
      res.json(task);
    }
  });
});

// Returns all the systems in the systems database
router.get("/get/systems", function (req, res, next) {
  systems_collection.find({}, function (err, response) {
    if (err) {
      res.send(err);
    } else {
      res.json(response);
    }
  });
});

/***
 * Save System
 */

// Updates the system with the corresponding :botid in the systems database
router.post("/save/system/:botid", function (req, res, next) {
  console.log("save bot");
  if (!(req && req.body)) {
    return res.status(400).json({ err: "request is invalid" });
  }
  const botid = req.params.botid;

  if (botid !== "new") {
    let query = { $set: req.body };
    systems_collection.update(
      { _id: mongojs.ObjectID(botid) },
      query,
      function (err, updateResult) {
        if (err) {
          return res.send(err);
        } else {
          res.json({ message: "success" });
        }
      }
    );
  } else {
    console.log("no botid");
    systems_collection.insert(req.body, function (err, instance) {
      if (err) {
        res.status(400).json({ err: "new session save failed" });
      } else {
        console.log("Done insert new system");
        instance["message"] = "success";
        res.json(instance);
      }
    });
  }
});

// Saves the dialog with the userID and name of the dialog (made through interactive mode); used when the user inputs something into the system
router.post("/dialog_save", function (req, res, next) {
  if (!(req && req.body)) {
    return res.status(400).json({ err: "request is invalid" });
  }
  const subId = req.body.subId;
  const userID = req.body.userID;
  const name_of_dialog = req.body.name_of_dialog;
  const taskID = req.body.taskID;
  const role = req.body.role;
  const utter = req.body.utter;

  interactive_resultcollection.findOne(
    { userID: userID, name_of_dialog: name_of_dialog, taskID: taskID },
    function (err, results) {
      if (err) {
        res.status(400).json({ err: "err" });
      } else {
        if (results) {
          let query = { $push: {} };
          query["$push"]["dialog"] = { role: role, utter: utter };
          interactive_resultcollection.update(
            { userID: userID, name_of_dialog: name_of_dialog, taskID: taskID },
            query,
            function (err, updateResult) {
              if (err) {
                return res.send(err);
              }
              if (updateResult.nModified) {
                console.log("Done Saving dialog");
              } else {
                console.log("dialog not added");
              }
              res.json(updateResult);
            }
          );
        } else {
          let query = {
            subId: subId,
            userID: userID,
            name_of_dialog: name_of_dialog,
            feedback: [],
            taskID: taskID,
            dialog: [{ role: role, utter: utter }],
          };
          interactive_resultcollection.insert(
            query,
            function (err, updateResult) {
              if (err) {
                return res.send(err);
              } else {
                res.json(updateResult);
              }
            }
          );
        }
      }
    }
  );
});

// Updates the dialog with the userID and name of the dialog with the feedback given by the worker
router.post("/feedback", function (req, res, next) {
  if (!(req && req.body)) {
    return res.status(400).json({ err: "request is invalid" });
  }
  const userID = req.body.userID;
  const name_of_dialog = req.body.name_of_dialog;
  const feedback = req.body.feedback;
  const utter = req.body.utter;

  let query = { $push: {} };
  query["$push"]["feedback"] = { utter: utter, feedback: feedback };
  interactive_resultcollection.update(
    { userID: userID, name_of_dialog: name_of_dialog },
    query,
    function (err, updateResult) {
      if (err) {
        return res.send(err);
      }
      if (res.nModified) {
        console.log("Done Saving dialog");
      } else {
        console.log("dialog not added");
      }
      res.json(updateResult);
    }
  );
});

// Saves the input from the worker: what they've done for the task including surveys, selections, etc.
router.post("/save/worker/:task_type/:userID", function (req, res, next) {
  if (!(req && req.body)) {
    return res.status(400).json({ err: "request is invalid" });
  }
  const task_type = req.params.task_type;
  const userID = req.params.userID;

  let collection;
  switch (task_type) {
    case "quality":
      return taskModelQuality.resSave(req, res);
    case "category":
      return taskModelCategory.resSave(req, res);
    case "sequence":
      return taskModelSequence.resSave(req, res);
  }

  if (task_type === "interactive") {
    collection = interactive_resultsurvey;
    let data = req.body.data;
    let submissiontime = req.body.submissiontime;
    let subId = req.body.subId;
    let output = [];
    let times = req.body.times;
    Object.keys(data).map((x, _) => {
      let temp = {};
      let X = x.split("|||");
      temp["Type"] = X[0];
      temp["A"] = data[x];
      debugger;
      if (X[0] === "Sub") {
        temp["Name"] = X[1];
        temp["Type"] = X[2];
        temp["Q"] = X[3];
      } else {
        if (X[0].indexOf("Exit") >= 0) {
          temp["Name"] = "EXIT";
          temp["Q"] = X[1];
        } else {
          temp["Name"] = "FEEDBACK";
          temp["Q"] = X[1];
        }
      }
      output.push(temp);
    });

    let query = { survey: output, times: times, timestamp: submissiontime };
    taskModelInteractive.collectionResult
      .updateOne(
        { subId: subId, userID: userID },
        { $set: query, $currentDate: { lastModifiedDate: true } },
        { upsert: true }
      )
      .then(() => taskModelInteractive.handleSaved(subId, userID))
      .then(() => res.json({ success: true }))
      .catch((err) => {
        res.status(500).json({ error: "Something bad happens." });
        console.log(err);
      });
  } else if (task_type === "category") {
    collection = category_resultcollection;
    let context = req.body;
    let data = context["data"];
    let userID = context["userID"];
    let results = JSON.parse(context["Result"]);
    let feedback = context["feedback"];
    let output = [];
    console.log("context", context);
    Object.keys(results).forEach(function (x) {
      let temp = {};
      if (x.indexOf("|||") !== -1) {
        let X = x.split("|||");
        temp["Type"] = X[0];
        temp["A"] = results[x];
        temp["Q"] = X[1];
        output.push(temp);
      }
    });
    data.forEach((x) => {
      let sentid = x["sentid"].toString();
      if (Object.keys(results).includes(sentid)) {
        let cate = results[sentid];
        let confidence_cate = 2;
        if (Object.keys(results).includes("Conf:" + sentid)) {
          confidence_cate = parseInt(results["Conf:" + sentid]);
        }
        collection.findOne(
          { projID: context["ID"], sentid: parseInt(sentid) },
          function (err, emd) {
            if (emd) {
              let query = { $push: {} };
              query["$push"]["category"] = cate;
              query["$push"]["meta"] = {
                annotator: context["mid"],
                submissionID: userID,
                confidence: confidence_cate,
                feedback: output,
                feedback_questions: feedback,
              };
              collection.update(
                { projID: context["ID"], sentid: parseInt(sentid) },
                query
              );
            } else {
              collection.insert(
                {
                  projID: context["ID"],
                  sentid: parseInt(sentid),
                  sentence: x["sentence"],
                  category: [cate],
                  meta: [
                    {
                      annotator: context["mid"],
                      submissionID: userID,
                      confidence: confidence_cate,
                      feedback: output,
                      feedback_questions: feedback,
                    },
                  ],
                },
                function (err, result) {}
              );
            }
          }
        );
      }
    });
  } else if (task_type === "sequence") {
    function handleUpdated() {
      return (
        taskModelSequence
          .validateSubmission(req.body.ID, req.body.userID)
          // .then(
          //   () => {
          //     return taskModelSequence.updateAgreeInter(req.body.ID);
          //   }
          // ).then(
          //   () => {
          //     return taskModelSequence.updateAgreeData(req.body.ID);
          //   }
          .then((results) => {
            res.json({ success: true });
          })
          .catch((err) => {
            if (err === "Duplicated submission.") {
              res.status(409).json({ error: err });
            } else {
              console.log(err);
              res.status(500).json({ error: "Something bad happens." });
            }
          })
      );
    }
    collection = sequence_resultcollection;
    let context = req.body;
    let userID = context["userID"];
    let x = context["Result"];
    let List = [];
    List.push({
      sentid: x["sentid"],
      sentence: x["sentence"],
      annotator: context["mid"],
      submissionID: userID,
      entity: x["entity"],
      time: x["time"],
      feedback: x["feedback"],
    });
    collection.findOne(
      { projID: context["ID"], sentid: x["sentid"] },
      function (err, emd) {
        if (emd) {
          let query = { $push: {} };
          query["$push"]["entity"] = x["entity"];
          query["$push"]["meta"] = {
            annotator: context["mid"],
            submissionID: userID,
            time: x["time"],
            feedback: x["feedback"],
          };
          collection.update(
            {
              projID: context["ID"],
              sentid: x["sentid"],
              // prevent double submission.
              meta: { $not: { $elemMatch: { submissionID: req.body.userID } } },
            },
            query,
            function (err, emd) {
              handleUpdated();
            }
          );
        } else {
          collection.insert(
            {
              projID: context["ID"],
              sentid: x["sentid"],
              sentence: x["sentence"],
              entity: [x["entity"]],
              meta: [
                {
                  annotator: context["mid"],
                  submissionID: userID,
                  time: x["time"],
                  feedback: x["feedback"],
                },
              ],
            },
            function (err, emd) {
              handleUpdated();
            }
          );
        }
      }
    );
  } else {
    collection = quality_resultcollection;
    let context = req.body;
    let x = context["Result"];
    let data = context["data"];
    data.forEach(function (datas, index) {
      collection.findOne(
        { projID: context["ID"], sentid: datas["sentid"] },
        function (err, emd) {
          if (emd) {
            let query = { $push: {} };
            query["$push"]["meta"] = {
              annotator: context["mid"],
              submissionID: context["userID"],
              time: x.times[index],
              feedback: x["feedback"],
              responses: x["responses"][index],
            };
            collection.update(
              { projID: context["ID"], sentid: datas["sentid"] },
              query,
              function (err, emd) {
                console.log("a new submission!");
              }
            );
          } else {
            collection.insert(
              {
                sentid: datas["sentid"],
                projID: context["ID"],
                context: datas["context"],
                response: datas["response"],
                meta: [
                  {
                    annotator: context["mid"],
                    submissionID: context["userID"],
                    time: x["times"][index],
                    feedback: x["feedback"],
                    responses: x["responses"][index],
                  },
                ],
              },
              function (err, emd) {}
            );
          }
        }
      );
    });
  }
});

// Saves task when requester puts out a HIT
router.post("/save/task/:task_type/:task_id", function (req, res, next) {
  if (!(req && req.body)) {
    return res.status(400).json({ err: "request is invalid" });
  }
  const task_type = req.params.task_type;
  const task_id = req.params.task_id;

  let collection;
  let data;
  if (task_type === "interactive") {
    collection = interactive_collection;
    data = {
      keys2: [],
      password: req.body.password,
      name_of_dialog: [],
      dialog_examples: [],
      dialog_counterexamples: [],
      name: req.body.project,
      keys: [],
      specific_instructions: [],
      speech: false,
      interface: "both",
      subtypeofpoll: [],
      generic_instructions: "",
      subpoll: [],
      generic_introduction: "",
      pollquestion: [],
      uuid2: 0,
      user: "23k3kl23kl23kl23j",
      typeofpoll: [],
      MNor1N: "1N",
      url_dialog_system: [],
      nickname: req.body.nickname,
      createdAt: Date.now(),
      counterexample: [],
      example: [],
      payment: "",
      time: "",
      consent: "",
    };
  } else if (task_type === "category") {
    collection = category_collection;
    data = {
      name: req.body.project,
      numofsent: 5,
      numoflabel: 3,
      category_data: [],
      generic_instructions: "",
      generic_introduction: "",
      keys2: [],
      user: "23k3kl23kl23kl23j",
      classLabel: [],
      classCounterexample: [],
      numofhit: 10,
      password: req.body.password,
      nickname: req.body.nickname,
      classExample: [],
      createdAt: Date.now(),
      keys: [],
      feedback: [],
      feedbackType: [],
      payment: "",
      time: "",
      consent: "",
    };
  } else if (task_type === "sequence") {
    collection = sequence_collection;
    data = {
      password: req.body.password,
      name: req.body.project,
      numoflabel: 3,
      generic_instructions: "",
      Label: [],
      generic_introduction: "",
      keys2: [],
      user: "23k3kl23kl23kl23j",
      numofhit: 3,
      nickname: req.body.nickname,
      Example: [],
      createdAt: Date.now(),
      sequence_data: [],
      Counterexample: [],
      payment: "",
      time: "",
      consent: "",
    };
  } else {
    collection = quality_collection;
    data = {
      name: req.body.project,
      quality_data: [],
      generic_instructions: "",
      generic_introduction: "",
      keys2: [],
      user: "23k3kl23kl23kl23j",
      example: [],
      counterexample: [],
      typeofpoll: [],
      pollquestion: [],
      numofhit: 10,
      password: req.body.password,
      nickname: req.body.nickname,
      createdAt: Date.now(),
      keys: [],
      feedback: [],
      feedbackType: [],
      payment: "",
      time: "",
      consent: "",
    };
  }
  if (task_id !== "new") {
    console.log("**CHANGE BOT CONFIGURE**");
    let query = { $set: req.body, $currentDate: { lastModifiedDate: true } };
    collection.update(
      { _id: mongojs.ObjectID(task_id) },
      query,
      function (err, updateResult) {
        if (err) {
          return res.send(err);
        }
        console.log("Task added");
        updateResult["message"] = "success";
        res.json(updateResult);
      }
    );
  } else {
    console.log("NO BOT NEW PROJECT");
    data.password = passwordHash.generate(data.password);
    collection.insert(data, function (err, instance) {
      if (err) {
        res.status(400).json({ err: "new session save failed" });
      } else {
        console.log("Done insert new system");
        instance["message"] = "success";
        res.json(instance);
      }
    });
  }
});

// Gets the detailed results from the detail_category table with the worker statistics and information of that task
router.get("/get/detail_result/:task_type/:task_id", function (req, res, next) {
  const task_type = req.params.task_type;
  const task_id = req.params.task_id;
  let getMean = function (data) {
    return (
      data.reduce(function (a, b) {
        return Number(a) + Number(b);
      }) / data.length
    );
  };
  let getSD = function (data) {
    let m = getMean(data);
    return Math.sqrt(
      data.reduce(function (sq, n) {
        return sq + Math.pow(n - m, 2);
      }, 0) / data.length
    );
  };

  let collection;

  if (task_type === "category") {
    collection = category_detail_result_collection;
  }

  collection.find({ taskId: task_id }, function (err, results) {
    let Dic = {};
    let Output = [];

    let all_totals = [];

    results.forEach((x) => {
      let userId = x["userId"].toString();
      if (!Object.keys(Dic).includes(userId)) {
        Dic[userId] = {};
        Dic[userId]["duration"] = [];
        Dic[userId]["label"] = [];
        Dic[userId]["total"] = [];
      }
      x["duration"] = x["duration"] / 1000;
      x["timestamp"] = new Date(parseFloat(x["timestamp"]));
      Dic[userId]["total"].push(x);
      Dic[userId]["duration"].push(x["duration"]);
      Dic[userId]["label"].push(x["label"]);
    });
    let avg = 0;
    let allsame = "no";
    let outlier = "no";
    let mean;
    let stdev;

    Object.keys(Dic).forEach((userId) => {
      let x = Dic[userId]["duration"];
      let sum_x = x.reduce((a, b) => a + b, 0);
      all_totals.push(sum_x);
    });

    try {
      mean = getMean(all_totals);
      stdev = getSD(all_totals);
    } catch (err) {
      // console.log("empty");
    }

    let std = 0;
    Object.keys(Dic).forEach((userId) => {
      let x = Dic[userId]["duration"];
      let sum_x = x.reduce((a, b) => a + b, 0);
      if (sum_x === 0) {
        avg = 0;
      } else {
        avg = Math.round(getMean(x) * 100) / 100;
        std = Math.round(getSD(x) * 100) / 100;
        let y = Dic[userId]["label"];
        // abnormal if we chose the same thing for everything
        if ([...new Set(y)].length < 2) {
          allsame = "yes";
        } else {
          allsame = "no";
        }
      }
      // check for outliers, 2.5% tails of the data of avg time (2 std away from mean)
      // calculated from total time
      if (sum_x < mean - 2 * stdev || sum_x > mean + 2 * stdev) {
        outlier = "yes";
      } else {
        outlier = "no";
      }
      Output.push({
        userId: userId,
        total_duration: Math.round(sum_x * 100) / 100,
        average_duration: avg,
        std_duration: std,
        allsame: allsame,
        detail: Dic[userId]["total"],
        num: Dic[userId]["total"].length,
        outlier: outlier,
      });
    });
    res.json({ response: Output });
  });
});

// Returns the results of the HIT from the unique :task_id
router.get(
  "/get/result/:task_type/:task_id/:password",
  function (req, res, next) {
    const task_type = req.params.task_type;
    task_id = req.params.task_id;
    const password = req.params.password;

    if (password !== "flyingbroom") {
      task_id = "602a96848af59d231cec21ee";
    }

    let collection;
    if (task_type === "interactive") {
      collection = interactive_resultcollection;
      collection.find({ subId: task_id }, function (err, task) {
        if (err) {
          return res.send(err);
        } else {
          // console.log(task);
          interactive_resultsurvey.find(
            { subId: task_id },
            function (err, survey) {
              // console.log("task", task);
              // console.log("survey", survey);
              //survey.forEach(x=>{console.log(x)});
              return res.json({ dialog: task, survey: survey, status: 200 });
            }
          );
        }
      });
    } else if (task_type === "category") {
      collection = category_resultcollection;
      collection.find({ projID: task_id }, function (err, task) {
        if (err) {
          return res.send(err);
        } else {
          let List = [];
          let result_for_kappa = {};
          let category = [];
          task.forEach((x, _) => {
            let tem = {};
            tem["sentence"] = x["sentence"];
            tem["sentid"] = x["sentid"];
            tem["result"] = [];
            let Dic = {};
            let conf = 2;

            x["category"].forEach(function (cate, i) {
              if (!category.includes(cate)) {
                category.push(cate);
              }
              if (x["meta"][i]) {
                let annotator_id = x["meta"][i]["submissionID"].toString();

                if (!Object.keys(result_for_kappa).includes(annotator_id)) {
                  result_for_kappa[annotator_id] = {};
                }

                result_for_kappa[annotator_id][x["sentid"]] = cate;
                if (!Dic.hasOwnProperty(x["meta"][i]["submissionID"])) {
                  Dic[x["meta"][i]["submissionID"]] = 0;
                  if (x["meta"][i].hasOwnProperty("confidence")) {
                    conf = x["meta"][i]["confidence"];
                  } else {
                    conf = 2;
                  }
                  tem["result"].push({
                    category: cate,
                    annotator: x["meta"][i]["annotator"],
                    submissionID: x["meta"][i]["submissionID"],
                    confidence: conf,
                    feedback: x["meta"][i]["feedback"],
                    feedback_questions: x["meta"][i]["feedback_questions"],
                  });
                  tem["num"] = Object.keys(Dic).length;
                  List.push(tem);
                }
              }
            });
          });
          if (Object.keys(result_for_kappa).length < 2) {
            return res.json({
              status: 200,
              flag: true,
              response: List,
              kappa: {},
            });
          } else {
            let kappa = {};
            Object.keys(result_for_kappa).forEach((annotator1) => {
              kappa[annotator1] = {};
              Object.keys(result_for_kappa).forEach((annotator2) => {
                if (annotator1 === annotator2) {
                  kappa[annotator1][annotator2] = null;
                } else {
                  let numeric1 = Cohen.nominalConversion(
                    category,
                    result_for_kappa[annotator1]
                  );
                  let numeric2 = Cohen.nominalConversion(
                    category,
                    result_for_kappa[annotator2]
                  );
                  kappa[annotator1][annotator2] = Cohen.kappa(
                    numeric1,
                    numeric2,
                    category.length,
                    "none"
                  );
                }
              });
            });
            return res.json({
              status: 200,
              flag: true,
              response: List,
              kappa: kappa,
            });
          }
        }
      });
    } else if (task_type === "sequence") {
      collection = sequence_resultcollection;
      collection.find({ projID: task_id }, function (err, task) {
        if (err) {
          return res.send(err);
        } else {
          return res.json({ response: task, status: 200 });
        }
      });
    } else {
      collection = quality_resultcollection;
      collection.find({ projID: task_id }, function (err, task) {
        if (err) {
          return res.send(err);
        } else {
          return res.json({ response: task, status: 200 });
        }
      });
    }
  }
);

// Deletes a HIT
// router.post("/delete/:task_type/:task_id", function (req, res, next) {
//   const taskType = req.params.task_type;
//   const taskId = req.params.task_id;
//   const password = req.body.password;

//   if (mapTaskModel[taskType] === undefined) {
//     return res.status(500).json({ error: "unsupported task" });
//   } else {
//     return mapTaskModel[taskType].resDeleteProject(res, taskId, password);
//   }

//   // need to remove the detail stuff too
//   let collection;
//   if (task_type === "interactive") {
//     collection = interactive_collection;
//     interactive_resultcollection.remove({ projID: task_id });
//   } else if (task_type === "category") {
//     collection = category_collection;

//     category_resultcollection.remove({ projID: task_id });
//     category_detail_result_collection.remove({ taskId: task_id });
//   } else if (task_type === "sequence") {
//     collection = sequence_collection;
//     sequence_resultcollection.remove({ projID: task_id });
//   } else {
//     collection = quality_collection;
//     quality_resultcollection.remove({ projID: task_id });
//   }
//   collection.remove({ _id: mongojs.ObjectID(task_id) }, function (err, task) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.json({ response: task });
//     }
//   });
// });

// // Deletes the result of the worker from that HIT -> where is this used
// router.get("/delete/result/:task_type/:task_id", function (req, res, next) {
//   const task_type = req.params.task_type;
//   const task_id = req.params.task_id;
//   // It is actually user id. Don't get fooled.
//   const idSubmission = parseInt(req.params.task_id);

//   let collection;
//   if (task_type === "interactive") {
//     collection = interactive_resultcollection;
//     collection.remove({ userID: task_id }, function (err, task) {});
//     taskModelInteractive.resDeleteSubmission(res, idSubmission);
//   } else if (task_type === "category") {
//     category_detail_result_collection.remove({ userId: parseInt(task_id) });
//     taskModelCategory.resDeleteSubmission(res, idSubmission);
//   } else if (task_type === "sequence") {
//     taskModelSequence.resDeleteSubmission(res, idSubmission);
//   } else {
//     taskModelQuality.resDeleteSubmission(res, idSubmission);
//   }
// });

/*
router.post('/actions/:lang/:taskId', function (req, res, next) {
  if (!(req && req.body)) {
    return res.status(400).json({err: 'request is invalid'});
  }
  const taskId = req.params.taskId;
  const lang = req.params.lang;
  const action = req.body;

  if (!action || !taskId || !lang || !action instanceof String) {
    return res.status(400).json({err: 'bad input parameters'});

  }
  if (!action['value']) {
    return res.status(400).json({err: 'system response value is missing'})
  }
  const system_response = action.value;
  let query = {$addToSet: {}};
  query["$addToSet"][lang + ".system_actions"] = system_response;
  action_collection.update({task_id: taskId}, query,
      function (err, updateResult) {
        if (err) {
          return res.send(err);
        }
        if (res.nModified) {
          console.log("Done adding a new action");
        } else {
          console.log("Action not added");
        }
        res.json(updateResult)
      });
});
*/

/*
Worker Backend
 */

// System uses this to get the task from the database whenever the worker wants to do a HIT
router.get("/worker/:task_type/:task_id", function (req, res, next) {
  const task_type = req.params.task_type;
  const task_id = req.params.task_id;

  switch (task_type) {
    case "category":
      return taskModelCategory.resHit(res, task_id);

    case "sequence":
      return taskModelSequence.resHit(res, task_id);

    case "quality":
      return taskModelQuality.resHit(res, task_id);
  }

  console.log(task_id);
  let collection;
  if (task_type === "interactive") {
    collection = interactive_collection;
  } else if (task_type === "category") {
    collection = category_collection;
  } else if (task_type === "sequence") {
    collection = sequence_collection;
  } else {
    collection = quality_collection;
  }
  collection.findOne({ _id: mongojs.ObjectID(task_id) }, function (err, task) {
    if (err) {
      res.send(err);
    } else {
      task["flag"] = true;
      if (task_type === "category") {
        task["exampleTable"] = [];
        task["category_data"] = shuffle(task["category_data"]);
        task["classLabel"].map((x, i) => {
          try {
            task["exampleTable"].push({
              label: x,
              example: task["classExample"][i],
              counterexample: task["classCounterexample"][i],
            });
          } catch (err) {
            task["exampleTable"].push({
              label: x,
              example: task["classExample"][i],
            });
          }
        });
        res.json(task);
      } else if (task_type === "sequence") {
        task["sequence_data"] = shuffle(task["sequence_data"]);
        task["exampleTable"] = [];
        task["Label"].map((x, i) => {
          try {
            task["exampleTable"].push({
              label: x,
              example: task["Example"][i],
              counterexample: task["Counterexample"][i],
            });
          } catch (err) {
            task["exampleTable"].push({
              label: x,
              example: task["Example"][i],
            });
          }
        });
        res.json(task);
      } else if (task_type === "interactive") {
        task["exampleTable"] = [];
        task["pollquestion"].map((x, i) => {
          try {
            task["exampleTable"].push({
              question: x,
              example: task["example"][i],
              counterexample: task["counterexample"][i],
            });
          } catch (err) {
            task["exampleTable"].push({
              question: x,
              counterexample: task["counterexample"][i],
            });
          }
        });
        res.json(task);
      }
    }
  });
});

const client_manager = {
  MAX_INT: 100000,
  _clients_to_id: {},
  join_client: function (session_id) {
    var is_new = false;
    var msg = "";
    if (Object.keys(this._clients_to_id).includes(session_id)) {
      msg = "You have connected to an existing session";
      is_new = false;
    } else {
      msg = "Hello! Welcome to DialCrowd! Say START to begin.";
      url = session_id.split("\t")[1] + "/%s";
      console.log(url);
      if (!url.includes("http")) {
        url = "http://" + url.replace(/^\s+|\s+$/g, "");
      }
      cm = Object.create(client_meta);
      cm.task = "name";
      cm.url = url;
      this._clients_to_id[session_id] = cm;
      is_new = true;
    }
    return [is_new, msg];
  },
  activate_talk: function (session_id) {
    if (Object.keys(this._clients_to_id).includes(session_id)) {
      this._clients_to_id[session_id].is_active = true;
    }
  },
  deactivate_talk: function (session_id) {
    if (Object.keys(this._clients_to_id).includes(session_id)) {
      this._clients_to_id[session_id].is_active = false;
    }
  },
  get_active: function (session_id) {
    if (Object.keys(this._clients_to_id).includes(session_id)) {
      is_active = this._clients_to_id[session_id].is_active;
      return is_active;
    } else {
      return null;
    }
  },
  get_url: function (session_id) {
    if (Object.keys(this._clients_to_id).includes(session_id)) {
      return this._clients_to_id[session_id].url;
    } else {
      return null;
    }
  },
  get_task: function (session_id) {
    if (Object.keys(this._clients_to_id).includes(session_id)) {
      return this._clients_to_id[session_id].task;
    } else {
      return null;
    }
  },
  remove_client: function (session_id) {
    delete this._clients_to_id[session_id];
  },
};

const client_meta = {
  task: "",
  url: "",
  _is_active: false,
  is_active: function (value) {
    if (value) {
      this._is_active = value;
    }

    return this._is_active;
  },
};

var util = require("util");

const cli_manager = Object.create(client_manager);

// Initializes and puts the new session in the client manager
router.post("/router/chat/join", function (req, res, next) {
  let session_id = req.body.sid + "";
  if (!session_id) {
    console.log("Missing session id. Reject connection");
  } else {
    console.log(util.format("%s makes connection", session_id));
    returned = cli_manager.join_client(session_id);
    is_new = returned[0];
    msg = returned[1];

    console.log("Init Sessions with session ID:", session_id);
    server_url = cli_manager.get_url(session_id);
    console.log(server_url, "server_url");
    cli_manager.activate_talk(session_id);

    url = server_url.replace("%s", "init");
    userID = req.body.userId || "userId";
    payload = { sessionID: session_id, timeStamp: "TODO", userID: userID };
    console.log("Send message " + JSON.stringify(payload));
    console.log(url);
    urllib.request(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify(payload),
      },
      (error, body, resp) => {
        console.log("========Here========");
        if (error) {
          console.log("error");
          console.error(error);
          // console.log("LOG error")
          // console.log(error)
        }
        if (resp) {
          console.log("resp");
          console.log(resp.statusCode);
          console.log(body);

          // console.log("LOG RESPONSE")
          // console.log(resp)
          if (resp.statusCode == 200) {
            console.log("Received " + body);
            response_get = get_resp(JSON.parse(body));
            console.log("msg", response_get[1], typeof response_get[1]);
            console.log(JSON.stringify(response_get[1]));
            console.log("sent message");
            if (response_get[0]) {
              cli_manager.deactivate_talk(session_id);
            }
            res.send({
              action: "status",
              is_new: is_new,
              terminal: response_get[0],
              msg: response_get[1],
              display: response_get[3],
              extraDiv1: response_get[4],
              extraDiv2: response_get[5],
            });
          }
        }
      }
    );

    // res.send({ "action": 'status', "is_new": is_new, "msg": msg });
  }
});

function get_resp(body) {
  // display, extraDiv1, and extraDiv2 are all extra variables; requesters can pass in other
  // variables other than the response
  // this is for research purposes
  try {
    var sys = body.sys || "";
    var sesID = body.sessionID || "";
    var display = body.display || "";
    var extraDiv1 = body.extraDiv1 || "";
    var extraDiv2 = body.extraDiv2 || "";
    return [body.terminal || false, sys, sesID, display, extraDiv1, extraDiv2];
  } catch (error) {
    return [true, "error"];
  }
}

// Connects back to the active session_id and sends the user message to the remote system
router.post("/router/chat/usr_input", function (req, res, next) {
  const session_id = req.body.sid + "";
  if (!session_id) {
    console.log("Missing session id. Reject connection");
    return;
  }
  usr_input = req.body.msg || "empty";
  userID = req.body.userId || "userId";
  taskID = req.body.taskID || "empty";
  asr_conf = req.body.score || 1.0;
  console.log(cli_manager._clients_to_id);
  console.log(session_id);
  server_url = cli_manager.get_url(session_id);
  console.log(server_url, "server_url");
  console.log("-----------> taskID", taskID);

  if ("start" === usr_input.toLowerCase().trim()) {
    let session_is_active = cli_manager.get_active(session_id);
    console.log("IS ACTIVE?", session_is_active);
    if (!session_is_active) {
      console.log("-----------> taskID", taskID);
      url = server_url.replace("%s", "init");
      payload = {
        sessionID: session_id,
        timeStamp: "TODO",
        userID: userID,
        taskID: taskID,
      };
      cli_manager.activate_talk(session_id);
    } else {
      console.log("-----------> taskID", taskID);
      url = server_url.replace("%s", "next");
      payload = {
        sessionID: session_id,
        text: usr_input,
        asrConf: asr_conf,
        timeStamp: "TODO",
        userID: userID,
        taskID: taskID,
      };
    }
  }
  // else if ("bye" == usr_input.toLowerCase().trim()) {
  //   url = server_url.replace("%s", "end");
  //   payload = { "sessionID": session_id, "timeStamp": "TODO", "userID": userID }
  // }
  else if (!cli_manager.get_active(session_id)) {
    res.send({ action: "status", msg: "Please type or say START to begin." });
    return;
  } else {
    url = server_url.replace("%s", "next");
    payload = {
      sessionID: session_id,
      text: usr_input,
      asrConf: asr_conf,
      timeStamp: "TODO",
      userID: userID,
      taskID: taskID,
    };
  }

  console.log("Send message " + JSON.stringify(payload));
  console.log(url);
  request.post(
    url,
    {
      json: payload,
    },
    (error, resp, body) => {
      if (error) {
        console.error(error);
        // console.log("LOG error")
        // console.log(error)
      }
      if (resp) {
        console.log(resp.statusCode);
        console.log(body);

        // console.log("LOG RESPONSE")
        // console.log(resp)
        if (resp.statusCode == 200) {
          console.log("Received " + body);
          response_get = get_resp(body);
          console.log("msg", response_get[1], typeof response_get[1]);
          console.log(JSON.stringify(response_get[1]));
          console.log("sent message");
          if (response_get[0]) {
            cli_manager.deactivate_talk(session_id);
          }
          res.send({
            action: "message",
            terminal: response_get[0],
            msg: response_get[1],
            display: response_get[3],
            extraDiv1: response_get[4],
            extraDiv2: response_get[5],
          });
        }
      } else {
        res.send({
          action: "message",
          msg: "Network connection error",
          terminal: true,
        });
      }
    }
  );
});

// Connects to the active session_id and sends a post request to the remote system to end the conversation; also removes the session from the active session list
router.post("/router/chat/leave", function (req, res, next) {
  session_id = req.body.sid + "";
  is_active = cli_manager.get_active(session_id);
  if (session_id == null) {
    console.log("session id not found");
    return;
  }
  console.log(session_id + " leave the session when " + is_active.toString());
  server_url = client_manager.get_url(session_id);
  url = server_url.replace("%s", "next");
  if (is_active == true) {
    request.post(
      url,
      {
        json: {
          sessionID: session_id,
          text: "SSTTOOPP",
          asrConf: 1.0,
          timeStamp: "TODO",
        },
      },
      (error, resp, body) => {
        if (error) {
          console.error(error);
        }
      }
    );
  }
  cli_manager.remove_client(session_id);
});

router.post(
  "/save/worker/detail/:task_type/:userID",
  function (req, res, next) {
    const task_type = req.params.task_type;
    const userID = req.params.userID;
    let collection;

    if (task_type === "category") {
      collection = category_detail_result_collection;
      collection.insert(req.body.data, function (err, data) {
        if (err) {
          res.status(400).json({ err: "worker detail info save failed" });
        } else {
          console.log("Done update worker detail");
          res.json(data);
        }
      });
    }
  }
);

// validate the interactive dialogue is acceptable or not based on simple rules
router.get(
  "/validate/dialogue/:task_id/:user_id/:bot_name",
  function (req, res, next) {
    const task_id = req.params.task_id;
    const user_id = req.params.user_id;
    const chatbot_name = req.params.bot_name;

    let collection = interactive_resultcollection;
    console.log("validate dialogue (rest_api)");
    collection.find(
      { subId: task_id, userID: user_id, name_of_dialog: chatbot_name },
      async function (err, task) {
        if (err) {
          console.log("err!", err);
          return res.send(err);
        } else {
          console.log("dialogueTest go");
          const task_info = await getTaskInfo(task_id);
          console.log("=======================================");
          console.log(task_info);
          console.log("=======================================");
          return res.json(dialogueTest(task, task_info));
        }
      }
    );
  }
);

function randomSelect(list) {
  if (typeof list == "undefined") {
    return "";
  }
  return list[Math.floor(Math.random() * list.length)];
}

function getTaskInfo(task_id) {
  return new Promise((resolve, reject) => {
    let collection = interactive_collection;

    collection.findOne({ _id: mongojs.ObjectID(task_id) }, (err, task) => {
      if (err) {
        reject(err);
      }
      let obj = JSON.parse(JSON.stringify(task));
      //console.log(obj);
      let taskList = obj["interactive_task_data"];
      //console.log("taskList", taskList);

      let currentTask = [];
      if (typeof taskList != "undefined") {
        currentTask = randomSelect(taskList);
      }
      console.log("current task", currentTask);

      resolve({ task: currentTask["sentence"] });
    });
  });

  // collection.findOne({ _id: mongojs.ObjectID(task_id) }, (err, task) => {
  //     if (err) {return err}
  //     let obj = JSON.parse(JSON.stringify(task));
  //     //console.log(obj);
  //     let taskList = obj["interactive_task_data"];
  //     console.log("taskList", taskList);

  //     let currentTask = [];
  //     if (typeof taskList != "undefined") {
  //       currentTask = randomSelect(taskList);
  //     }
  //     console.log("current task", currentTask);

  //     return { task: currentTask["sentence"] }

  // });
}

router.get("/get_interactive_task/:task_id", function (req, res, next) {
  task_id = req.params.task_id;
  console.log("Interactive Tasks: " + task_id);
  let collection = interactive_collection;
  collection.findOne({ _id: mongojs.ObjectID(task_id) }, function (err, task) {
    if (err) {
      res.send(err);
    } else {
      let obj = JSON.parse(JSON.stringify(task));
      //console.log(obj);
      let taskList = obj["interactive_task_data"];
      //console.log("taskList", taskList);

      let currentTask = [];
      if (typeof taskList != "undefined") {
        currentTask = randomSelect(taskList);
      }
      console.log("current task", currentTask);

      res.json({ task: currentTask["sentence"] });
    }
  });
});

module.exports = router;
