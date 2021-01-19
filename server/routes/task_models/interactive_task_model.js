const { MongoClient, ObjectId } = require("mongodb");
const {TaskModel, clientMongo}  = require('./task_model.js');


class InteractiveTaskModel extends TaskModel {
  static collectionTask = 'interactive';
  static collectionResult = 'interactive_survey';
  findResults (id) {
    /* Params:
     * {@String}	id: Project/task id.
     */
    return this.collectionResult.find({subId: id}).toArray();
  }

  saveSubmission (idTask, idSubmission, annotations) {
    let ops = [];
    for (let annotation of annotations) {
      ops.push({
        updateMany: {
          filter: {subId: idTask, _id: annotation._id},
          update: {
            $set: annotation
          }
        }          
      });
    }
    return this.collectionResult.bulkWrite(ops, {ordered : false});
  }

  saveResults (idTask, results) {
    let ops = [];
    for (const annotation of results.unit[0].annotations) {
      ops.push({
        updateOne: {
          filter: {
            $and: [
              {subId: idTask, _id: annotation._id},
              {$or: [
                {lastModifiedDate: {$lte: annotation.lastModifiedDate}},
                {lastModifiedDate: {$exists: false}}
              ]}
            ]
          },
          update: {
            $set: annotation            
          }
        }
      });
    }
    return this.collectionResult.bulkWrite(ops, {ordered : false});
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

  _formatTask (task) {
    /* Convert task data from db to a format universal across tasks. 
     * It ensures task to have property `{@Array} units` and 
     * `{@Array} dataGolden`, and each element in them has properties:
     *    - id
     *    - {@Array} questions: Array of questions.
     */
    task.units = [{id: 0}];
    task.dataGolden = [];
    task.questions = [].concat( 
      // concat system questions for each system
      ...task.questionSystems.map(
        // extact questions for the system
        qSys => [].concat(
          qSys.questions.map(
            // add property `section: 'system'` to each question.
            q => ({...q, section: 'system', systemName: qSys.name})
          )
        )
      )
    ).concat(
      // concat system questions and survey questions.
      task.questionSurveys.map(
        // add property `section: 'survey'` to each question.
        q => ({...q, section: 'survey'})
      )
    );
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
    let unit0 = {annotations: results.map(
      result => ({
        ...result,
        _id: result._id,
        submissionID: result.userID,
        times: result.times,
        answer: result.survey.filter(x => x.Name !== 'FEEDBACK').map(x => x.A),
        lastModifiedDate: result.lastModifiedDate
      })
    )};
    return {unit: {0: unit0}};
  }
  
  handleSaved (subId, userID) {
    return this.validateSubmission(subId, userID).then(
      () => {
        return this.updateAgreeInter(subId);
      }
    ).then(
      () => {
        return this.updateAgreeData(subId);
      }
    );
  }

  resDeleteSubmission (res, idSubmission) {
    this.collectionResult.findOne(
      {userID: `${idSubmission}`}
    ).then(result => {
      const idTask = result.subId;
      return this.collectionResult.deleteOne(
        {userID: `${idSubmission}`}
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


const taskModelInteractive = new InteractiveTaskModel(clientMongo);
module.exports = taskModelInteractive;
