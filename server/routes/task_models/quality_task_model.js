const { MongoClient, ObjectId } = require("mongodb");
const {TaskModel, clientMongo}  = require('./task_model.js');
const { shuffle } = require("./shuffle.js");


class QualityTaskModel extends TaskModel {
  static collectionTask = 'quality';
  static collectionResult = 'quality_result';

  _formatTask (task) {
    /* Convert task data from db to a format universal across tasks. 
     * It ensures task to have property `{@Array} units` and 
     * `{@Array} dataGolden`, and each element in them has a property `id`.
     */
    task.units = task.quality_data.map(
      conv => ({...conv, id: conv.sentid})
    );
    task.dataGolden = (task.dataGolden || []).map(
      unit => ({...unit, id: unit.sentid})
    );
    task.questions = task.questionSurveys;
    return task;
  }
  
  _formatResult (results) {
    /* Ensure the result has the following structure:
     * { unit : 
     *     { `key_of_unit` : {
     *          lastModifiedDate: {@timestamp},
     *          question: {context: {@String}, response {@String}},
     *          annotations: [ {annotation}, ... ] },
     *       ....
     *     }
     * }
     */
    const extractAnswers = (annotation) => {
      const keys = Object.keys(annotation.responses).sort(
        key => parseInt(key.split('|||').slice(-1)[0])
      );
      return keys.map(key => annotation.responses[key]);
    };
    let unit = {};
    for (const result of results) {
      unit[result.sentid] = {
        question: {context: result.context, response: result.response},
        annotations: result.meta.map(
          annotation => ({...annotation, answer: extractAnswers(annotation)})
        ),
        lastModifiedDate: result.lastModifiedDate,
        agreements: result.agreements
      };
    }
    return {unit: unit};
  }
  
  resHit (res, idTask) {
    /* Respond to a request
     * Params:
     * {@res}		res: `res` of express.js.
     * {@String}	idTask: Project/task id.
     */
    this.getHit(idTask).then(hit => {
      // when the task has been done
      if (hit.units === null) {
        return res.status(400).json({err: 'The task is not available now.'});
      }

      // adapt to response format.
      hit.quality_data = shuffle(hit.units);
      hit.units = undefined;
      hit.flag = true;
      return res.json(hit);
    });
  }
          
  resSave (req, res) {
    const extractAnswers = (annotation) => {
      const keys = Object.keys(annotation.responses).sort(
        key => parseInt(key.split('|||').slice(-1)[0])
      );
      return keys.map(key => annotation.responses[key]);
    };

    const userID = req.params.userID;
    let ops = []; //  Operations on DB
    const now = Date.now();

    // check if the submission id has been submitted.
    this.collectionResult.find(
      {projID: req.body.ID, meta: {$elemMatch: {submissionID: req.body.userID}}}
    ).toArray().then(results => {
      if (results.length > 0) {
        throw 'Duplicated submission.';
      }
      for (const [index, unit] of req.body.data.entries()) {
        let annotation = {
          annotator: req.body.mid,
          submissionID: req.body.userID,
          time: req.body.Result.times[index],
          feedback: req.body.Result.feedback,
          responses: req.body.Result.responses[index],
          order: index,
          timestamp: now,
          response: unit.response,
          context: unit.context
        };
        annotation.answer = extractAnswers(annotation);
        ops.push(
          {
            updateMany: {
              filter: {projID: req.body.ID, sentid: unit.sentid, meta: {$exists: true}},
              update: {
                $currentDate: {lastModifiedDate: true},
                $push: {
                  meta: annotation
                }
              },
              upsert: true
            }
          }
        );
      }
      return this.collectionResult.bulkWrite(ops, {ordered : true});
    }).then(
      results => {
        return this.validateSubmission(req.body.ID, req.body.userID);
      }
    ).then(
      () => {
        return this.updateAgreeInter(req.body.ID);
      }
    ).then(
      () => {
        return this.updateAgreeData(req.body.ID);
      }
    ).then(
      (results) => {
        res.json({success: true});
      }
    ).catch(      
      err => {
        if (err === 'Duplicated submission.') {
          res.status(409).json({error: err});
        } else {
          console.log(err);
          res.status(500).json({error: 'Something bad happens.'});
        }
      }
    );
  }
}

const taskModelQuality = new QualityTaskModel(clientMongo);
module.exports = taskModelQuality;
