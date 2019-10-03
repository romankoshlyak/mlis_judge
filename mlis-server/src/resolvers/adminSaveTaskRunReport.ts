import { Op, Transaction } from 'sequelize';
import { fromGlobalId } from 'graphql-relay';

import AppContext from './../context';
import { assertTrue, requireValue } from './../utils';
import { Test, TestRunReport } from '../models';

function checkLess(value: number | null, limit: number | null) {
  return limit != null && (value == null || value < limit);
}
function checkMore(value: number | null, limit: number | null) {
  return limit != null && (value == null || value > limit);
}
function checkTestRun(testRunReport: TestRunReport, test: Test): [boolean, string | null] {
  if (checkMore(testRunReport.modelSize, test.modelSizeLimit)) {
    return [false, `Model size ${testRunReport.modelSize} > ${test.modelSizeLimit}`];
  }
  if (checkMore(testRunReport.trainingSteps, test.trainingStepsLimit)) {
    return [false, `Training steps ${testRunReport.trainingSteps} > ${test.trainingStepsLimit}`];
  }
  if (testRunReport.trainingSteps === 0) {
    return [false, `You forget to report steps: call context.increase_step() every step`];
  }
  if (checkMore(testRunReport.trainingTime, test.trainingTimeLimit)) {
    return [false, `Training time ${testRunReport.trainingTime} > ${test.trainingTimeLimit}`];
  }
  if (checkMore(testRunReport.trainEvaluationTime, test.trainEvaluationTimeLimit)) {
    return [false, `Train evaluation time ${testRunReport.trainEvaluationTime} > ${test.trainEvaluationTimeLimit}`];
  }
  if (checkMore(testRunReport.trainMetric, test.trainMetricLimit)) {
    return [false, `Train metric ${testRunReport.trainMetric} > ${test.trainMetricLimit}`];
  }
  if (checkLess(testRunReport.trainAccuracy, test.trainAccuracyLimit)) {
    return [false, `Train accuracy ${testRunReport.trainAccuracy} < ${test.trainAccuracyLimit}`];
  }
  if (checkMore(testRunReport.testEvaluationTime, test.testEvaluationTimeLimit)) {
    return [false, `Train evaluation time ${testRunReport.testEvaluationTime} > ${test.testEvaluationTimeLimit}`];
  }
  if (checkMore(testRunReport.testMetric, test.testMetricLimit)) {
    return [false, `Train metric ${testRunReport.testMetric} > ${test.testMetricLimit}`];
  }
  if (checkLess(testRunReport.testAccuracy, test.testAccuracyLimit)) {
    return [false, `Train accuracy ${testRunReport.testAccuracy} < ${test.testAccuracyLimit}`];
  }
  return [true, null];
}
async function updateTestRunReport(testRunReport: TestRunReport, input: any, transaction: Transaction) {
  const FINISHED = 'FINISHED';
  testRunReport.stdOut = input.stdOut;
  testRunReport.stdErr = input.stdErr;
  testRunReport.status = FINISHED;
  if (input.result != null) {
    input.result.evaluationTime = input.result.testEvaluationTime;
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
  return updatedTestRunReport;
}

function calcStats(reports: TestRunReport[], puller: (report:TestRunReport) => number|null) {
  if (reports.length == 0) {
    return [null, null, null]
  }
  const firstValue = puller(reports[0]);
  let minValue = Infinity;
  let sumValue = 0;
  let maxValue = -Infinity;
  for (const report of reports) {
    const value = puller(report);
    if (value == null) {
      return [null, null, null];
    }
    minValue = (minValue < value) ? minValue : value;
    sumValue += value;
    maxValue = (value < maxValue) ? maxValue : value;
  }
  return [minValue, sumValue/reports.length, maxValue];
}

async function updateTestSetRunReport(testRunReport: TestRunReport, transaction: Transaction) {
  const FINISHED = 'FINISHED';
  let testSetRunReport = await testRunReport.getTestSetRunReport({transaction});
  const testRunReports = await testSetRunReport.getTestRunReports({transaction});
  testSetRunReport.isAccepted = testRunReports.every(report => report.isAccepted);

  [testSetRunReport.modelSizeMin, testSetRunReport.modelSizeMean, testSetRunReport.modelSizeMax] =
    calcStats(testRunReports, (report => report.modelSize));
  [testSetRunReport.trainingStepsMin, testSetRunReport.trainingStepsMean, testSetRunReport.trainingStepsMax] =
    calcStats(testRunReports, (report => report.trainingSteps));
  [testSetRunReport.trainingTimeMin, testSetRunReport.trainingTimeMean, testSetRunReport.trainingTimeMax] =
    calcStats(testRunReports, (report => report.trainingTime));
  [testSetRunReport.trainEvaluationTimeMin, testSetRunReport.trainEvaluationTimeMean, testSetRunReport.trainEvaluationTimeMax] =
    calcStats(testRunReports, (report => report.trainEvaluationTime));
  [testSetRunReport.trainMetricMin, testSetRunReport.trainMetricMean, testSetRunReport.trainMetricMax] =
    calcStats(testRunReports, (report => report.trainMetric));
  [testSetRunReport.trainAccuracyMin, testSetRunReport.trainAccuracyMean, testSetRunReport.trainAccuracyMax] =
    calcStats(testRunReports, (report => report.trainAccuracy));
  [testSetRunReport.testEvaluationTimeMin, testSetRunReport.testEvaluationTimeMean, testSetRunReport.testEvaluationTimeMax] =
    calcStats(testRunReports, (report => report.testEvaluationTime));
  [testSetRunReport.testMetricMin, testSetRunReport.testMetricMean, testSetRunReport.testMetricMax] =
    calcStats(testRunReports, (report => report.testMetric));
  [testSetRunReport.testAccuracyMin, testSetRunReport.testAccuracyMean, testSetRunReport.testAccuracyMax] =
    calcStats(testRunReports, (report => report.testAccuracy));

  testSetRunReport.status = FINISHED;
  const updatedTestSetRunReport = await testSetRunReport.save({transaction});
  assertTrue(updatedTestSetRunReport.status == FINISHED);

  return updatedTestSetRunReport;
}

function compareArrays(a: any[], b: any[]) {
  for (let i = 0; i < a.length; i++) {
    const ai = a[i];
    const bi = b[i];
    if (ai != bi) {
      if (ai < bi) {
        return -1;
      } else if (ai > bi) {
        return 1;
      } else {
        return 0;
      }
    }
  }
  return 0;
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
    const updatedTestRunReport = await updateTestRunReport(testRunReport, input, transaction);
    let publishTestRunReportChanged = async () => {
        await pubsub.publish(
          `testRunReportChanged:${testRunReport.id}`,
          {
            testRunReportChanged : updatedTestRunReport
          }
        );
    }
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
        if (updatedTestSetRunReport.isAccepted) {
          const submission = await updatedTestRunReport.getSubmission();
          const problemId = updatedTestRunReport.problemId;
          const userId = submission.ownerId;
          const submissionId = submission.id;
          const [metric1, metric2, metric3] = await updatedTestSetRunReport.getMetricValuesForRanking({transaction});
          const mainMetric = requireValue(metric1);
          let ranking = await models.Ranking.findOne({
            where : {
              problemId,
              userId
            },
            transaction
          })
          if (ranking == null) {
            ranking = await models.Ranking.create(
              {
                problemId,
                userId,
                submissionId,
                metric1,
                metric2,
                metric3,
              },
              {
                transaction
              }
            );
          } else {
            if (compareArrays([ranking.metric1, ranking.metric2, ranking.metric3], [metric1, metric2, metric3]) > 0) {
              ranking.metric1 = mainMetric;
              ranking.metric2 = metric2;
              ranking.metric3 = metric3;
              ranking.submissionId = submissionId;
              ranking = await ranking.save();
            }
          }
          assertTrue(ranking.id != null);
        }

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
    await transaction.commit();
    await publishTestRunReportChanged();
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