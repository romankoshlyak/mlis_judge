import { connectionFromArray, cursorForObjectInConnection, fromGlobalId } from 'graphql-relay';
import { UserInputError } from 'apollo-server';
import { Test, TestSetRunReport, TestRunReport, Task, TestSet, Ranking, getGlobalRanking, Class, ClassStudent, Metric } from './models';
import { Submission, Problem, User } from './models';
import { assertTrue, requireValue, getGlobalId } from './utils';
import { Op, Transaction } from 'sequelize';
import moment from 'moment';
import AppContext from './context';
import adminSaveTaskRunReport from './resolvers/adminSaveTaskRunReport';
import login from './resolvers/login';
import logout from './resolvers/logout';
import updateClassStudent from './resolvers/updateClassStudent';
import deleteClassStudent from './resolvers/deleteClassStudent';

export default {
  Node: {
    __resolveType(obj:any, context:any, info:any) {
      return null;
    },
  },
  Admin: {
    viewer: async (parent: null, args: any, { viewer }: AppContext) => {
      return viewer;
    },
  },
  AdminViewer: {
    user: async (parent: any, args: any, { viewer }: AppContext) => {
      return viewer;
    },
    problems: async (_parent: any, args: any, { models }: AppContext) => {
      const problems = await models.Problem.findAll();
      return connectionFromArray(problems, args);
    },
  },
  ClassStudent: {
    id: (parent: ClassStudent) => getGlobalId(parent),
    student: async (classStudent: ClassStudent) => {
      return await classStudent.getStudent();
    },
    createdAt: (clazz: ClassStudent) => {
      return clazz.createdAt.getTime();
    },
  },
  Class: {
    id: (parent: Class) => getGlobalId(parent),
    startAt: (clazz: Class) => {
      return clazz.startAt.getTime();
    },
    firstTaskDueAt: (clazz: Class) => {
      return clazz.firstTaskDueAt.getTime();
    },
    mentor: async (clazz: Class) => {
      return await clazz.getMentor();
    },
    students: async (clazz: Class, args: any, { viewer }: AppContext) => {
      const students = await clazz.getClassStudents({
        order: ['createdAt']
      });
      return connectionFromArray(students, args);
    },
    studentsCount: async (clazz: Class) => {
      return await clazz.countClassStudents();
    },
    viewerIsApplied: async (clazz: Class, args: any, {viewer}: AppContext) => {
      const students = await clazz.getClassStudents({
        where: {
          studentId: viewer!.id,
        }
      });
      return students.length > 0;
    },
    viewerIsEleminated: async (clazz: Class, args: any, {viewer}: AppContext) => {
      const students = await clazz.getClassStudents({
          where: {
            studentId: viewer!.id,
            isEleminated: true
          }
      });
      return students.length > 0;
    },
  },
  Ranking: {
    id: (parent: Ranking) => getGlobalId(parent),
    user: async (ranking: Ranking) => {
      return await ranking.getUser();
    },
    submission: async (ranking: Ranking) => {
      return await ranking.getSubmission();
    },
    updatedAt: (ranking: Ranking) => {
      return ranking.updatedAt.getTime();
    }
  },
  GlobalRanking: {
    user: async (ranking: any, args: any, { models }: AppContext) => {
      return await models.User.findByPk(ranking.userId);
    },
  },
  Problem: {
    id: (parent: Problem) => getGlobalId(parent),
    submissions: async (problem: Problem, args: any, { viewer }: AppContext) => {
      viewer = requireValue(viewer);
      const submissions = await problem.getSubmissions({
        where: {ownerId: viewer.id},
      });
      return connectionFromArray(submissions, args);
    },
    testSets: async (problem: Problem, args: any, { viewer }: AppContext) => {
      const testSets = await problem.getTestSets();
      return connectionFromArray(testSets, args);
    },
    ranking: async (problem: Problem, args: any, { viewer }: AppContext) => {
      const ranking = await problem.getRankings({
        order: ['metric1', 'metric2', 'metric3']
      });
      return connectionFromArray(ranking, args);
    },
    metrics: async (problem: Problem, args: any, { viewer }: AppContext) => {
      const testSets = await problem.getTestSets();
      assertTrue(testSets.length == 1);
      const testSet = testSets[0];
      const metrics = await testSet.getMetrics();
      return metrics;
    },
  },
  User: {
    id: (parent: User) => getGlobalId(parent),
  },
  Submission: {
    id: (parent: Submission) => getGlobalId(parent),
    testSetRunReport: async (submission: Submission) => {
      return await submission.getTestSetRunReport();
    },
    problem: async (submission: Submission) => {
      return await submission.getProblem();
    },
  },
  Metric: {
    id: (metric: Metric) => getGlobalId(metric),
  },
  TestSet: {
    id: (testSet: TestSet) => getGlobalId(testSet),
  },
  Test: {
    id: (test: Test) => getGlobalId(test),
  },
  TestRunReport: {
    id: (testRunReport: TestRunReport) => getGlobalId(testRunReport),
    problem: async (testRunReport: TestRunReport) => {
      return await testRunReport.getProblem();
    },
    test: async (testRunReport: TestRunReport) => {
      return await testRunReport.getTest();
    },
    submission: async (testRunReport: TestRunReport) => {
      return await testRunReport.getSubmission();
    },
  },
  TestSetRunReport: {
    id: (testSetRunReport: TestSetRunReport) => getGlobalId(testSetRunReport),
    testRunReports: async (testSetRunReport: TestSetRunReport, args: any, { viewer }: AppContext) => {
      const testRunReports = await testSetRunReport.getTestRunReports();
      return connectionFromArray(testRunReports, args);
    },
    metricValues: async (testSetRunReport: TestSetRunReport, args: any, { viewer }: AppContext) => {
      const testSet = await testSetRunReport.getTestSet();
      const metrics = await testSet.getMetrics();
      return metrics.map((metric) => {
        return {
          metric,
          value: testSetRunReport.getMetricValue(metric),
        }
      })
    },
  },
  Task: {
    id: (task: Task) => getGlobalId(task),
    testRunReport: async (task: Task) => {
      return await task.getTestRunReport();
    },
  },
  Viewer: {
    user: async (parent: any, args: any, { models, viewer }: any) => {
      return viewer;
    },
    submission: async (parent: any, {id}: any, { models, viewer }: any) => {
      const globalId = fromGlobalId(id);
      const submission = await models.Submission.findByPk(globalId.id);
      return submission;
    },
    problem: async (parent: any, {id}: any, { models }: AppContext) => {
      const globalId = fromGlobalId(id);
      const problem = await models.Problem.findByPk(globalId.id);
      return problem;
    },
    problems: async (_parent: any, args: any, { models }: AppContext) => {
      const problems = await models.Problem.findAll();
      return connectionFromArray(problems, args);
    },
    globalRanking: async (_parent: any, args: any, { models }: AppContext) => {
      const globalRanking = await getGlobalRanking();
      return connectionFromArray(globalRanking, args);
    },
    class: async (_parent: any, {id}: any, { models }: AppContext) => {
      const globalId = fromGlobalId(id);
      const problem = await models.Class.findByPk(globalId.id);
      return problem;
    },
    classes: async (_parent: any, args: any, { models }: AppContext) => {
      const classes = await models.Class.findAll();
      return connectionFromArray(classes, args);
    },
  },
  Main: {
    viewer: async (parent: any, args: any, { viewer }: AppContext) => {
      return viewer;
    },
  },
  Query: {
    main: async (parent: any, args: any, { models, viewer }: any) => {
      return 1;
    },
    admin: async (parent: any, args: any, { models, viewer }: any) => {
      return 1;
    },
  },
  Mutation: {
    login,
    logout,
    adminSaveTaskRunReport,
    updateClassStudent,
    deleteClassStudent,
    adminAddProblem: async (parent: any, { input }: any, { models }: any) => {
      const problem = await models.Problem.create(input);
      const problems = await models.Problem.findAll();
      return {
        problemEdge: {
          node: problem,
          cursor: cursorForObjectInConnection(problems.map((p:any) => p.id), problem.id),
        },
        clientMutationId: input.clientMutationId,
      };
    },
    adminChangeProblem: async (parent: any, { input }: any, { models }: any) => {
      const [count, [updatedProblem]] = await models.Problem.update(
        { text: input.text },
        {
          where: {id: fromGlobalId(input.id).id},
          returning: true,
        },
      );
      if (count != 1) {
        throw new Error('Error during update');
      }
      return {
        problem: updatedProblem,
        clientMutationId: input.clientMutationId,
      };
    },
    adminRemoveProblem: async (parent: any, { input }: any, { models }: any) => {
      const numberOfRemoved = await models.Problem.destroy(
        { where: {id: fromGlobalId(input.id).id} }
      );
      if (numberOfRemoved != 1) {
        throw new Error('ERROR');
      }
      return {
        removedProblemId: input.id,
        clientMutationId: input.clientMutationId,
      }
    },
    adminGetTask: async (parent: any, { input }: any, { models, pubsub }: AppContext) => {
      const transaction = await models.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        }
      );
      try {
        const SCHEDULED = 'SCHEDULED';
        const RUNNING = 'RUNNING';
        const failedTasks = await models.Task.findAll(
          {
            where: {
              status: RUNNING,
              updatedAt: {
                [Op.lte]: moment().subtract(1, 'minutes').toDate()
              }
            },
            transaction
          }
        )
        const rescheduledTasks = await Promise.all(failedTasks.map(async (task) => {
          task.attempt += 1;
          task.status = SCHEDULED;
          return await task.save(
            {
              transaction
            }
          );
        }));
        let taskAdded = async () => {}
        if (rescheduledTasks.length > 0) {
          taskAdded = async () => {
            await pubsub.publish('taskAdded', {taskAdded:'retry task'});
          }
        }
        rescheduledTasks.forEach((task) => assertTrue(task.status == SCHEDULED));
        let nextTask = await models.Task.findOne(
          {
            where: { status: SCHEDULED },
            order: ['updatedAt'],
            transaction
          }
        )

        let publishTestRunReportChanged = async () => {}
        let publishTestSetRunReportChanged = async () => {}
        if (nextTask != null) {
          nextTask.status = RUNNING;
          const savePromises:Promise<any>[] = [];
          savePromises.push(nextTask.save({transaction}));
          const testRunReport = await nextTask.getTestRunReport({transaction});
          if (testRunReport.status !== RUNNING) {
            testRunReport.status = RUNNING;
            savePromises.push(testRunReport.save({transaction}));
            publishTestRunReportChanged = async () => {
              await pubsub.publish(
                `testRunReportChanged:${testRunReport.id}`,
                {
                  testRunReportChanged : testRunReport
                }
              );
            }
          }
          const testSetRunReport = await testRunReport.getTestSetRunReport();
          if (testSetRunReport.status !== RUNNING) {
            testSetRunReport.status = RUNNING;
            savePromises.push(testSetRunReport.save({transaction}));
            publishTestSetRunReportChanged = async () => {
              await pubsub.publish(
                `testSetRunReportChanged:${testSetRunReport.id}`,
                {
                  testSetRunReportChanged : testSetRunReport
                }
              );
            }
          }
          await Promise.all(savePromises);
        }
        await transaction.commit();
        await publishTestRunReportChanged();
        await publishTestSetRunReportChanged();
        await taskAdded();
        return {
          task: nextTask,
          clientMutationId: input.clientMutationId,
        }
      } catch (e) {
        await transaction.rollback();
        throw e;
      }
    },
    submit: async (parent: null, { input }: any, { viewer, models, pubsub }: AppContext) => {
      viewer = requireValue(viewer);

      const transaction = await models.sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE});
      try {
        const problemId = parseInt(fromGlobalId(input.problemId).id);
        const testSetId = parseInt(fromGlobalId(input.testSetId).id);
        const testSet = requireValue(await models.TestSet.findByPk(testSetId,
          {
            transaction
          }
        ));
        if (testSet!.problemId != problemId) {
          throw new UserInputError('TestSet and problem does not match', {
            invalidArgs: Object.keys(input),
          });
        }
        const SCHEDULED = 'SCHEDULED';
        const testSetRunReport = await models.TestSetRunReport.create(
          {
            testSetId: testSet.id,
            status: SCHEDULED,
          },
          {
            transaction
          }
        );
        requireValue(testSetRunReport.id);
        const submission = await models.Submission.create(
          {
            problemId: problemId,
            testSetRunReportId: testSetRunReport.id,
            ownerId: viewer.id,
            code: input.submissionCode,
          },
          {
            transaction
          }
        );
        requireValue(submission.id);
        const tests = await models.Test.findAll(
          {
            where: {testSetId},
            transaction
          }
        )
        const testRunReports = await models.TestRunReport.bulkCreate(
          tests.map((test) => {
            return {
              problemId: problemId,
              testId: test.id,
              submissionId: submission.id,
              testSetRunReportId: testSetRunReport.id,
              status: SCHEDULED,
            };
          }),
          {
            returning: true,
            transaction
          }
        );
        testRunReports.forEach((testRunReport) => requireValue(testRunReport.id));
        const tasks = await models.Task.bulkCreate(
          testRunReports.map((testRunReport) => {
            return {
              testRunReportId: testRunReport.id,
              attempt: 0,
              status: SCHEDULED,
            };
          }),
          {
            returning: true,
            transaction
          }
        );
        tasks.forEach((task) => requireValue(task.id));

        const submissions = await models.Submission.findAll(
          {
            transaction
          }
        );
        await transaction.commit()
        await pubsub.publish('taskAdded', {taskAdded:'new task'});
        return {
          submissionEdge: {
            node: submission,
            cursor: cursorForObjectInConnection(submissions.map((s) => s.id), submission.id),
          },
          clientMutationId: input.clientMutationId,
        };
      } catch (e) {
        await transaction.rollback()
        throw e;
      }
    },
    applyForClass: async (parent: null, { input }: any, { viewer, models, pubsub }: AppContext) => {
      viewer = requireValue(viewer);

      const transaction = await models.sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE});
      try {
        const classId = parseInt(fromGlobalId(input.classId).id);
        const clazz = requireValue(await models.Class.findByPk(classId));
        const classStudent = await models.ClassStudent.create(
          {
            classId,
            studentId: viewer.id,
            isEleminated: false,
          },
          {
            transaction
          }
        );
        assertTrue(classStudent.id != null);
        transaction.commit();
        return {
          class: clazz,
          clientMutationId: input.clientMutationId,
        };
      } catch (e) {
        await transaction.rollback()
        throw e;
      }
    },
  },
  Subscription: {
    taskAdded: {
      subscribe: (parent: any, input: any, {pubsub}:AppContext) => {
        return pubsub.asyncIterator('taskAdded');
      }
    },
    testSetRunReportChanged: {
      subscribe: (parent:any, input:any, {pubsub}:AppContext) => {
        const id = fromGlobalId(input.id).id;
        return pubsub.asyncIterator(`testSetRunReportChanged:${id}`)
      }
    },
    testRunReportChanged: {
      subscribe: (parent:any, input:any, {pubsub}:AppContext) => {
        const id = fromGlobalId(input.id).id;
        return pubsub.asyncIterator(`testRunReportChanged:${id}`)
      }
    }
  },
};