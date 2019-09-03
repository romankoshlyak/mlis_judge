import jwt from 'jsonwebtoken';
import Helper from './utils';
import { connectionFromArray, cursorForObjectInConnection, toGlobalId, fromGlobalId } from 'graphql-relay';
import { UserInputError } from 'apollo-server';
import ModelTypes, { Test, TestSetRunReport, TestRunReport, Task } from './models';
import { Submission, Problem, User } from './models';
import { assertTrue, requireValue, getGlobalId } from './utils';
import { Op, Transaction, ModelScopeOptions } from 'sequelize';
import moment from 'moment';
import { PubSub } from 'graphql-subscriptions';
import AppContext from './context';
import adminSaveTaskRunReport from './resolvers/adminSaveTaskRunReport';

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
  Problem: {
    id: (parent: Problem) => getGlobalId(parent),
    submissions: async (problem: Problem, args: any, { viewer }: AppContext) => {
      viewer = requireValue(viewer);
      const submissions = await problem.getSubmissions({
        where: {ownerId: viewer.id},
      });
      return connectionFromArray(submissions, args);
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
    loginOld: async (parent: any, { authType, accessToken }: any, context: AppContext) => {
      const models = context.models;
      const connection = context.connection;
      const appId = process.env.APP_ID;
      const appSecret = process.env.APP_SECRET; 
      const jwtSecret = process.env.JWT_SECRET || '';
      const appTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
      const appAccessToenJson = await Helper.loadJson(appTokenUrl);
      const appAccessToken = appAccessToenJson.access_token;
      const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`
      const accessTokenInfoJson = await Helper.loadJson(debugTokenUrl);
      const data = accessTokenInfoJson.data;
      if (data.is_valid && data.type == 'USER' && data.app_id == appId && data.user_id.length > 0) {
        let andEmail = ''
        if (data.scopes.includes('email')) {
          andEmail = ',email'
        }
        const getUserUrl = `https://graph.facebook.com/me?fields=id,name${andEmail}&access_token=${accessToken}`
        const userJson = await Helper.loadJson(getUserUrl);
        const userObj = {
          fbId: userJson.id,
          name: userJson.name,
          email: userJson.email
        }
        const [user, ] = await models.User.findOrCreate({
          where: {fbId: userObj.fbId},
          defaults: userObj,
        });
        if (user.fbId == userObj.fbId) {
          const token = jwt.sign(
            { user_id: user.id },
            jwtSecret,
            { expiresIn: '1y' },
          );
          if (connection != null) {
            connection.context.state.authorization = token;
          }
          return token;
        }
      }
    },
    login: async (parent: any, { input }: any, { connection }: AppContext) => {
      if (input.authType == 'CRYPTO_TOKEN') {
        const jwtSecret = process.env.JWT_SECRET;
        const tokenInfo = <{user_id:number}> await jwt.verify(input.token, jwtSecret!);
        const authorization = jwt.sign(
          { user_id: tokenInfo.user_id },
          jwtSecret!,
          { expiresIn: 60 },
        );
          if (connection != null) {
            connection.context.state.authorization = authorization;
          }
        return {
          authorization: authorization,
          clientMutationId: input.clientMutationId,
        }
      }
      throw new Error('Access denied');
    },
    adminSaveTaskRunReport,
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
    adminGetTask: async (parent: any, { input }: any, { models, pubsub }: { models: typeof ModelTypes, pubsub: PubSub }) => {
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

        let publishTestSetRunReportChanged = async () => {}
        if (nextTask != null) {
          nextTask.status = RUNNING;
          const savePromises:Promise<any>[] = [];
          savePromises.push(nextTask.save({transaction}));
          const testRunReport = await nextTask.getTestRunReport({transaction});
          if (testRunReport.status !== RUNNING) {
            testRunReport.status = RUNNING;
            savePromises.push(testRunReport.save({transaction}));
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
    }
  },
  Subscription: {
    taskAdded: {
      subscribe: (parent: any, input: any, {pubsub}:AppContext) => {
        return pubsub.asyncIterator('taskAdded');
      }
    },
    testSetRunReportChanged: {
      subscribe: (parent:any, input:any, {pubsub}:{pubsub:PubSub}) => {
        const id = fromGlobalId(input.id).id;
        return pubsub.asyncIterator(`testSetRunReportChanged:${id}`)
      }
    }
  },
};