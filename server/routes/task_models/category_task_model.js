const { MongoClient, ObjectId } = require("mongodb");
const {TaskModel, clientMongo}  = require('./task_model.js');
const { shuffle } = require("./shuffle.js");


class CategoryTaskModel extends TaskModel {
  static collectionTask = 'category';
  static collectionResult = 'category_result';

  _formatTask (task) {
    /* Convert task data from db to a format universal across tasks. 
     * It ensures task to have property `{@Array} units`, and each element
     * in it has property `id`.
     */
    task.units = task.category_data.map(
      sent => ({...sent, id: sent.sentid})
    );
    task.dataGolden = (task.dataGolden || []).map(
      sent => ({...sent, id: sent.sentid})
    );
    task.questions = ['Intent'];
    return task;
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
     */
    let unit = {};
    for (const result of results) {
      unit[result.sentid] = {
        question: result.sentence,
        annotations: result.meta,
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
      hit.category_data = shuffle(hit.units);
      hit.units = undefined;
      hit.flag = true;
      return res.json(hit);
    }).catch(err => {
      console.log(err);
      return res.status(500).json({error: "Something went wrong."});
    });
  }

  resSave (req, res) {
    const userID = req.params.userID;
    let ops = []; //  Operations on DB
    const now = Date.now();
    if (req.body.Result.length === 0) {
      throw 'Invalid request.';
    }

    // check if the submission id has been submitted.
    this.collectionResult.find(
      {$and: [
        {projID: req.body.ID, meta: {$elemMatch: {submissionID: req.body.userID}}},
        // {$or: sentIds.map(id => ({sentid: parseInt(id)}))}
      ]}
    ).toArray().then(results => {
      if (results.length > 0) {
        // Do not check duplicated submission for now...
        throw 'Duplicated submission.';
      }
    }).then(() => {
      const results = req.body.Result.slice(0, req.body.data.length);
      for (const [index, result] of results.entries()) {
        const annotation = {
          annotator: req.body.mid,
          submissionID: req.body.userID,
          feedback: req.body.feedback,
          answer: [result.answer],
          confidence: parseInt(result.confidence),
          order: index,
          timestamp: now,
          sentence: req.body.data[index].sentence,
        };
        ops.push(
          {
            updateMany: {
              filter: {projID: req.body.ID, sentid: result.sentid, meta: {$exists: true}},
              update: {
                $currentDate: {lastModifiedDate: true},
                $push: {
                  category: annotation.answer,
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

const taskModelCategory = new CategoryTaskModel(clientMongo);
module.exports = taskModelCategory;
