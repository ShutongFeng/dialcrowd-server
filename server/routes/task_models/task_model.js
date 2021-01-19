const path = require('path');
const config = require(path.join(__dirname, '../../config.js'));
const passwordHash = require('password-hash');
const { MongoClient, ObjectId } = require("mongodb");
const { shuffle } = require("./shuffle.js");
const { findPatternPeriod, equalAnnotation,
        calcAgreeInter, calcCohensKappa, pairwiseF1} = require('./quality.js');


const clientMongo = new MongoClient(config.mongoURI);


class TaskModel {
  static dataAgreementMetrics = {"Cohen's Kappa": calcCohensKappa};
  constructor (client) {
    client.connect().then( () => {
      this.collectionTask = client.db().collection(this.constructor.collectionTask);
      this.collectionResult = client.db().collection(this.constructor.collectionResult);
    });
  }

  resHit (res, idTask) {
    /* Respond to a request
     * Params:
     * {@res}		res: `res` of express.js.
     * {@String}	idTask: Project/task id.
     */
    throw 'Not implemented!';
  }

  resGetProjects (res) {
    /* Respond to the request of project list.
     * Params:
     * {@res}		res: `res` of express.js.
     */
    return this.collectionTask.find().project(
      {name: 1, nickname: 1, createdAt: 1}
    ).toArray().then(projects => {
      return res.json({response: projects});
    });
  }

  resDeleteProject (res, idTask, password) {
    /* Respond to the request to delete a HIT.
     * Params:
     * {@res}		res: `res` of express.js.
     * {@String}	idTask: Project/task id.
     * {@String}	password:.
     */
    return this.findTask(idTask).then(task => {
      let correct = false;
      if (!passwordHash.isHashed(task.password)) {        
        correct = password === task.password;
      } else {
        correct = passwordHash.verify(password, task.password);
      }
      if (correct) {
        return this.collectionTask.remove(
          {_id: ObjectId(idTask)}
        );
      } else {
        throw 'Incorrect password';
      }
    }).then(
      () => {res.json({success: true})}
    ).catch(
      () => {res.status(403).json({error: "Incorrect password."});}
    );
  }
  
  _formatTask (task) {
    /* Convert task data from db to a format universal across tasks. 
     * It ensures task to have property `{@Array} units` and 
     * `{@Array} dataGolden`, and each element in them has properties:
     *    - id
     *    - {@Array} questions: Array of questions.
     */
    return task;
  }

  _setDefaultValueTask (task) {
    /* Set default value for properties that are not given value. */
    task.nAssignment = task.nAssignment || 100000;
    task.nUnit = Math.min(task.nUnit || task.units.length, task.units.length);
    return task;
  }
  
  findTask (id) {
    /* Params:
     * {@String}	id: Project/task id.
     */
    return this.collectionTask.findOne({_id: ObjectId(id)});
  }

  _formatResult (results) {
    /* Ensure the result has the following structure:
     * { unit : 
     *     { `key_of_unit` : 
     *         { question: {context: {@String}, response {@String}},
     *         { annotations: [ {annotation}, ... ] },
     *       ....
     *     }
     * }
     * each annotation should have a filed `answer`.
     */
    return results;
  }
  
  findResults (id) {
    /* Params:
     * {@String}	id: Project/task id.
     */
    return this.collectionResult.find({projID: id}).toArray();
  }

  findTaskResults (idTask) {
    return this.findTask(idTask).then(task => 
      (
        this.findResults(idTask).then(results => ([task, results]))
      )
    );
  }

  getSubmission (idTask, idSubmission) {
    /* Find hits done by a user. 
     * Returns:
     * {@Object}	[{...annotation}]
     */
    return this.findResults(idTask).then(results => {
      results = this._formatResult(results);
      // extract annotation by the user.
      // Key will be the timestamp of the hit, key of the unit.
      let submissions = [];

      // extract only the last submission for each task unit
      for (const [idUnit, unit] of Object.entries(results.unit)) {
        for (const annotation of unit.annotations) {
          if (annotation.submissionID == idSubmission) {
            submissions.push({...annotation, idUnit: parseInt(idUnit)});
          }
        }
      }

      return submissions;
    });
  }

  saveSubmission (idTask, idSubmission, annotations) {
    let ops = [];
    for (let annotation of annotations) {
      ops.push({
        updateMany: {
          filter: {projID: idTask, sentid: annotation.idUnit},
          update: {
            $currentDate: {lastModifiedDate: true},
            $set: {
              'meta.$[f]': annotation
            }
          },
          arrayFilters: [{'f.submissionID': idSubmission, 'f.order': annotation.order}]
        }          
      });
    }
    return this.collectionResult.bulkWrite(ops, {ordered : false});
  }

  saveResults (idTask, results) {
    let ops = [];
    for (const [idUnit, unit] of Object.entries(results.unit)) {
      ops.push({
        updateMany: {
          filter: {
            $and: [
              {projID: idTask, sentid: parseInt(idUnit)},
              {$or: [
                {lastModifiedDate: {$lte: unit.lastModifiedDate}},
                {lastModifiedDate: {$exists: false}}
              ]}
            ]
          },
          update: {
            $set: {
              agreements: unit.agreements,
              meta: unit.annotations
            }
          }
        }
      });
    }
    return this.collectionResult.bulkWrite(ops, {ordered : false});
  }
    
  saveByUser (idTask, idUser, byUser) {
    throw 'Not implemented!';
  }
  
  validateSubmission (idTask, idSubmission) {
    return this.getSubmission(idTask, idSubmission).then((submission) => (
      this.findTask(idTask).then((task) => ([task, submission]))
    )).then(([task, annotations]) => {
      task = this._formatTask(task);
      
      const cmpAnnotation = equalAnnotation;
      annotations = annotations.sort((a1, a2) => (a1.order - a2.order));

      // detect pattern
      const patternPeriod = findPatternPeriod(annotations.map(a => (a.answer)));
      for (let annotation of annotations) {
        annotation.patternPeriod = patternPeriod;
      }

      // compare to themselves
      let answer = {};
      let agreeSelf = {};
      for (let annotation of annotations) {
        if (answer[annotation.idUnit] === undefined) {
          agreeSelf[annotation.idUnit] = undefined;
        } else if (cmpAnnotation(answer[annotation.idUnit], annotation.answer)) {
          agreeSelf[annotation.idUnit] = true;
        } else {
          agreeSelf[annotation.idUnit] = false;
        }
        answer[annotation.idUnit] = annotation.answer;
      }
      annotations = annotations.map(
        annotation => ({...annotation, agreeSelf: agreeSelf[annotation.idUnit]})
      );

      // compare to golden data
      let goldenAnswer = {};
      for (const unit of task.dataGolden || []) {
        goldenAnswer[task.units.length + unit.id] = unit.answer;
      }
      for (let annotation of annotations) {
        if (goldenAnswer[annotation.idUnit] === undefined) {
          annotation.agreeGold = undefined;
        } else if (cmpAnnotation(goldenAnswer[annotation.idUnit], annotation.answer)) {
          annotation.agreeGold = true;
        } else {
          annotation.agreeGold = false;
        }
      }
      return this.saveSubmission(idTask, idSubmission, annotations);
    });
  }

  updateAgreeInter (idTask) {
    /* Update agreement metrics that involves more than one submission.
     * Return: {@promise}
     */
    return this.findResults(idTask).then(results => {
      results = this._formatResult(results);
      for (let [idUnit, unit] of Object.entries(results.unit)) {
        let agreeMajors = calcAgreeInter(unit.annotations, 'major');
        unit.annotations = unit.annotations.map(
          (annotation) => ({
            ...annotation,
            agreeMajor: agreeMajors[annotation.submissionID],
          })
        );
        for (const a of unit.annotations) {
          if (typeof(a.agreeMajor) != 'number') {
            debugger;
          }
        }
      }
      return this.saveResults(idTask, results);
    });
  }

  updateAgreeData (idTask) {
    /* Update the agreement between the workers using metrics like Cohen's Kappa.
     */
    return this.findTaskResults(idTask).then(([task, results]) => {
      const metrics = this.constructor.dataAgreementMetrics;
      task = this._formatTask(task);
      results = this._formatResult(results);
      const questions = task.questions;
      const unitIds = task.units.map(unit => `${unit.id}`);
      let questionAgreements = [];  // questionAgreements[idxQ][metric]
      let lastModifiedDate = 0;
      for (const [idUnit, result] of Object.entries(results.unit)) {
          result.agreements = [];
      }
      for (const idxQ in questions) {
        // All answers for question idxQ, from all worker, across all units.
        let answers = [];  // answers[idxUnit][idWorker]
        for (const [idUnit, result] of Object.entries(results.unit)) {
          if (unitIds.indexOf(idUnit) === -1) { // skip golden data
            continue;
          }
          lastModifiedDate = Math.max(lastModifiedDate, result.lastModifiedDate);
          let workerAnswer = {};
          for (const annotation of result.annotations) {
            workerAnswer[annotation.submissionID] = annotation.answer[idxQ];
          }
          answers.push(workerAnswer);

          // calculate the metrics for this single unit
          let agreement = {};
          for (const [metric, metricFn] of Object.entries(metrics)) {
            agreement[metric] = metricFn([workerAnswer]);
          }
          result.agreements.push(agreement);
        }
        let agreements = {};  // agreement[metric]
        for (const [metric, metricFn] of Object.entries(metrics)) {
          debugger;
          agreements[metric] = metricFn(answers);
        }
        questionAgreements.push(agreements);
      }

      return this.saveResults(idTask, results).then(() => {
        return this.saveDataAgreements(idTask, questionAgreements);
      });
    });
    
  }

  saveDataAgreements (idTask, questionAgreements) {
    /* Save dataAgreements property (e.g. Cohen's Kappa) to collectionTask */
    return this.collectionTask.updateOne(
      {
        $and: [
          {_id: ObjectId(idTask)},
          // {$or: [
          //   {lastModifiedDateAgree: {$lte: lastModifiedDate}},
          //   {lastModifiedDateAgree: {$exists: false}}
          // ]}
        ]
      },
      {
        $set: {
          dataAgreements: questionAgreements
        }
      }
    );
  }
  
  getHit (idTask) {
    /* Select units that has no enough number of annotations.
     * Params:
     * {@String}	idTask: Project/task id.
     * Return:
     *    A promise, where the argument is the hit, which is `null` 
     *    if the task has been done (all units have had enough number
     *    of annotations).
     */
    
    return this.findTaskResults(idTask).then(([task, results]) => {

      task = this._formatTask(task);
      const result = this._formatResult(results);
      
      // Create mapping from ids to units in data
      let id2unit = {};
      for (const unit of task.units) {
        id2unit[unit.idUnit] = unit;
      }

      // collect number of annotation for each unit
      let nAnnotation = {};
      for (const [id, unit] of Object.entries(result.unit)) {
        // There duplicated records, so count the number of submissions here.
        let annotators = new Set(unit.annotations.map(a => (a.submissionID)));
        nAnnotation[id] = annotators.size;
      }
      for (const id of Object.keys(id2unit)) {
        nAnnotation[id] = nAnnotation[id] || 0;
      }
      
      // Order the convs with least annotation or smaller id first.
      task.units.sort((unit1, unit2) => {
        const id1 = unit1.id, id2 = unit2.id;
        // Compare ID in case # of annotation is the same.
        if (nAnnotation[id1] === nAnnotation[id2]) {
          return id1 < id2 ? -1 : 1 ; 
        }
        return nAnnotation[id1] > nAnnotation[id2] ? -1 : 1;
      });

      const nUnit = parseInt(task.nUnit);
      // If all the conversations are annotated by enough number of workers.
      const lastUnitId = task.units[task.units.length - 1].sentid;
      if (task.units.length == 0 || (nAnnotation[lastUnitId] || 0) >= task.nAssignment) {
        task.units = null;
      } else {
        const nTotalUnit = task.units.length;
        
        // Leave only `nAssignment` samples (give out the most done but not finished ones).
        let indexStart = 0;
        while (nAnnotation[task.units[indexStart].sentid] >= task.nAssignment) {
          indexStart += 1;
        }
        task.units = task.units.slice(indexStart, indexStart + nUnit);

        // For quality check: agree-self
        const nUnitDuplicated = task.nUnitDuplicated || 0;
        let duplicated = shuffle(task.units.map((x) => (x))).slice(0, nUnitDuplicated);
        task.units = task.units.concat(duplicated);

        // For quality check: agree-golden
        const nUnitGolden = task.nUnitGolden || 0;
        let goldens = shuffle(task.dataGolden || []).slice(0, nUnitGolden);
        goldens = goldens.map(golden => ({...golden, sentid: golden.sentid + nTotalUnit}));
        task.units = task.units.concat(goldens);
      }
      return task;
    });
  }

  resGetTask (res, taskId) {
    return this.findTask(taskId).then(task => {
      task = this._formatTask(task);
      task.password = undefined;
      res.json(task);
    });      
  }
  resGetResult (res, taskId) {
    return this.findResults(taskId).then(results => {
      res.json(this._formatResult(results));
    });      
  }
  resDeleteSubmission (res, idSubmission) {
    this.collectionResult.findOne({
      meta: {
        $elemMatch: {
          submissionID: idSubmission
        }
      }
    }).then(result => {
      const idTask = result.projID;
      return this.collectionResult.updateMany(
        {}, {
          $pull: {
            meta : {
              submissionID: idSubmission
            }
          }
        }
      ).then(
        () => this.updateAgreeInter(idTask)
      ).then(
        () => this.updateAgreeData(idTask)
      );
    }).then(
      () => res.json({success: true})
    ).catch(err => {
      console.log(err);
      res.status(500).json({error: 'Something went wrong.'});
    });
  }
}


module.exports = {TaskModel, clientMongo};
