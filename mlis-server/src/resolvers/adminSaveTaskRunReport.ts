import { Op, Transaction } from 'sequelize';
import { fromGlobalId } from 'graphql-relay';

import AppContext from './../context';
import { assertTrue, requireValue } from './../utils';
import { Test, TestRunReport } from '../models';

function checkTestRun(testRunReport: TestRunReport, test: Test): [boolean, string | null] {
  if (testRunReport.modelSize > test.modelSizeLimit) {
    return [false, `Model size ${testRunReport.modelSize} > ${test.modelSizeLimit}`];
  }
  if (testRunReport.trainingSteps > test.trainingStepsLimit) {
    return [false, `Training steps ${testRunReport.trainingSteps} > ${test.trainingStepsLimit}`];
  }
  if (testRunReport.trainingTime > test.trainingTimeLimit) {
    return [false, `Training time ${testRunReport.trainingTime} > ${test.trainingTimeLimit}`];
  }
  if (testRunReport.evaluationTime > test.evaluationTimeLimit) {
    return [false, `Evaluation time ${testRunReport.evaluationTime} > ${test.evaluationTimeLimit}`];
  }
  if (testRunReport.trainAccuracy < test.trainAccuracyLimit) {
    return [false, `Train accuracy ${testRunReport.trainAccuracy} < ${test.trainAccuracyLimit}`];
  }
  if (testRunReport.testAccuracy < test.testAccuracyLimit) {
    return [false, `Test accuracy ${testRunReport.testAccuracy} < ${test.testAccuracyLimit}`];
  }
  return [true, null];
}
async function updateTestRunReport(testRunReport: TestRunReport, input: any, transaction: Transaction) {
  const FINISHED = 'FINISHED';
  testRunReport.stdOut = input.stdOut;
  testRunReport.stdErr = input.stdErr;
  testRunReport.status = FINISHED;
  if (input.result != null) {
    testRunReport.setAttributes(input.result);
  }
  const test = await testRunReport.getTest();
  const [isAccepted, rejectReason] = checkTestRun(testRunReport, test);
  testRunReport.isAccepted = isAccepted;
  if (rejectReason != null) {
    testRunReport.rejectReason = rejectReason;
  }
  console.log(isAccepted, rejectReason);
  const updatedTestRunReport = await testRunReport.save({transaction});
  assertTrue(updatedTestRunReport.status == FINISHED);
}

async function updateTestSetRunReport(testRunReport: TestRunReport, transaction: Transaction) {
  const FINISHED = 'FINISHED';
  let testSetRunReport = await testRunReport.getTestSetRunReport({transaction});
  const testRunReports = await testSetRunReport.getTestRunReports({transaction});
  testSetRunReport.isAccepted = true;
  testSetRunReport.modelSizeMin = Infinity;
  testSetRunReport.modelSizeMean = 0;
  testSetRunReport.modelSizeMax = -Infinity;
  testSetRunReport.trainingStepsMin = Infinity;
  testSetRunReport.trainingStepsMean = 0;
  testSetRunReport.trainingStepsMax = -Infinity;
  testSetRunReport.trainingTimeMin = Infinity;
  testSetRunReport.trainingTimeMean = 0;
  testSetRunReport.trainingTimeMax = -Infinity;
  testSetRunReport.evaluationTimeMin = Infinity;
  testSetRunReport.evaluationTimeMean = 0;
  testSetRunReport.evaluationTimeMax = -Infinity;
  testSetRunReport.trainAccuracyMin = Infinity;
  testSetRunReport.trainAccuracyMean = 0;
  testSetRunReport.trainAccuracyMax = -Infinity;
  testSetRunReport.testAccuracyMin = Infinity;
  testSetRunReport.testAccuracyMean = 0;
  testSetRunReport.testAccuracyMax = -Infinity;
  for (const report of testRunReports) {
    testSetRunReport.isAccepted = testSetRunReport && report.isAccepted;
    testSetRunReport.modelSizeMin =  (testSetRunReport.modelSizeMin < report.modelSize) ? testSetRunReport.modelSizeMin : report.modelSize;
    testSetRunReport.modelSizeMean += report.modelSize;
    testSetRunReport.modelSizeMax =  (testSetRunReport.modelSizeMax > report.modelSize) ? testSetRunReport.modelSizeMax : report.modelSize;
    testSetRunReport.trainingStepsMin =  (testSetRunReport.trainingStepsMin < report.trainingSteps) ? testSetRunReport.trainingStepsMin : report.trainingSteps;
    testSetRunReport.trainingStepsMean += report.trainingSteps;
    testSetRunReport.trainingStepsMax =  (testSetRunReport.trainingStepsMax > report.trainingSteps) ? testSetRunReport.trainingStepsMax : report.trainingSteps;
    testSetRunReport.trainingTimeMin =  (testSetRunReport.trainingTimeMin < report.trainingTime) ? testSetRunReport.trainingTimeMin : report.trainingTime;
    testSetRunReport.trainingTimeMean += report.trainingTime;
    testSetRunReport.trainingTimeMax =  (testSetRunReport.trainingTimeMax > report.trainingTime) ? testSetRunReport.trainingTimeMax : report.trainingTime;
    testSetRunReport.evaluationTimeMin =  (testSetRunReport.evaluationTimeMin < report.evaluationTime) ? testSetRunReport.evaluationTimeMin : report.evaluationTime;
    testSetRunReport.evaluationTimeMean += report.evaluationTime;
    testSetRunReport.evaluationTimeMax =  (testSetRunReport.evaluationTimeMax > report.evaluationTime) ? testSetRunReport.evaluationTimeMax : report.evaluationTime;
    testSetRunReport.trainAccuracyMin =  (testSetRunReport.trainAccuracyMin < report.trainAccuracy) ? testSetRunReport.trainAccuracyMin : report.trainAccuracy;
    testSetRunReport.trainAccuracyMean += report.trainAccuracy;
    testSetRunReport.trainAccuracyMax =  (testSetRunReport.trainAccuracyMax > report.trainAccuracy) ? testSetRunReport.trainAccuracyMax : report.trainAccuracy;
    testSetRunReport.testAccuracyMin =  (testSetRunReport.testAccuracyMin < report.testAccuracy) ? testSetRunReport.testAccuracyMin : report.testAccuracy;
    testSetRunReport.testAccuracyMean += report.testAccuracy;
    testSetRunReport.testAccuracyMax =  (testSetRunReport.testAccuracyMax > report.testAccuracy) ? testSetRunReport.testAccuracyMax : report.testAccuracy;
  }
  testSetRunReport.modelSizeMean /= testRunReports.length;
  testSetRunReport.trainingStepsMean /= testRunReports.length;
  testSetRunReport.trainingTimeMean /= testRunReports.length;
  testSetRunReport.evaluationTimeMean /= testRunReports.length;
  testSetRunReport.trainAccuracyMean /= testRunReports.length;
  testSetRunReport.testAccuracyMean /= testRunReports.length;

  testSetRunReport.status = FINISHED;
  const updatedTestSetRunReport = await testSetRunReport.save({transaction});
  assertTrue(updatedTestSetRunReport.status == FINISHED);
  return updatedTestSetRunReport;
}

export default async function adminSaveTaskRunReport(parent: null, { input }: any, { models, pubsub }: AppContext) {
  const transaction = await models.sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });
  try  {
    const RUNNING = 'RUNNING';
    const FINISHED = 'FINISHED';
    const taskId = fromGlobalId(input.taskId).id;
    const taskAttempt: number = input.taskAttempt;
    const task = requireValue(await models.Task.findByPk(taskId, {transaction}));
    assertTrue(task.status == RUNNING);
    assertTrue(task.attempt == taskAttempt);
    const testRunReport = await task.getTestRunReport({transaction});
    await updateTestRunReport(testRunReport, input, transaction);
    const testsLeft = await models.TestRunReport.count(
        {
        where: {
            testSetRunReportId: testRunReport.testSetRunReportId,
            status: {
            [Op.ne]: FINISHED
            }
        },
        transaction
        },
    );
    let publishTestSetRunReportChanged = async () => {}
    if (testsLeft == 0) {
        const updatedTestSetRunReport = await updateTestSetRunReport(testRunReport, transaction);
        publishTestSetRunReportChanged = async () => {
          await pubsub.publish(
            `testSetRunReportChanged:${updatedTestSetRunReport.id}`,
            {
              testSetRunReportChanged : updatedTestSetRunReport
            }
          );
      }
    }
    task.status = FINISHED;
    const savedTask = await task.save({transaction});
    assertTrue(savedTask.status == FINISHED);
    transaction.commit();
    await publishTestSetRunReportChanged();
    return {
      clientMutationId: input.clientMutationId,
    }
  } catch (e) {
    console.log(e);
    transaction.rollback();
    throw e;
  }
}