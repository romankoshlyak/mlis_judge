
import jwt from 'jsonwebtoken';
import fs from 'fs';
import models, { User } from './models';
import resolvers from './resolvers';
import AppServer from './AppServer';
import { getGlobalId, requireValue } from './utils';
import loadProblemsFromConfigs from './loadProblemsFromConfigs';

async function getFile(fileName: string) {
  return (await fs.promises.readFile(fileName)).toString();
}
function getTokenFromUser(user: User) {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign(
    { user_id: user.id },
    jwtSecret!,
    { expiresIn: '1y' },
  );
}
export default async function initDevData() {
  await models.sequelize.sync({ force: true });
  const admin = await models.User.create({name: "admin"});
  const roman = await models.User.create({fbId: "10211973801580089", email: "rkoshlyak@gmail.com", name: "Roman Koshlyak"});

  const problem = requireValue(await loadProblemsFromConfigs());
  /*

  const xorDataProvider = await getFile('./problems/hello_xor_data_provider.py');
  const xorCodeTemplate = await getFile('./problems/hello_xor_code_template.py');
  const testLimits = {modelSizeLimit: 1000000.0, trainingStepsLimit: 1000000.0, trainingTimeLimit: 2.0, evaluationTimeLimit: 2.0, trainAccuracyLimit: 1.0, testAccuracyLimit: 1.0};
  // Tutorial
  {
    const generalCpuProblem = await models.Problem.create({name: "Tutorial", text: "If you new to Pytorch, click link below for Tutorial:", textUrl: "https://colab.research.google.com/drive/18BZOWGX217Ix2FOic2VlSEQBV6wPhA1c", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  const xorProblem = await models.Problem.create({name: "Hello Xor", text: "You need to learn xor function. See details in the link", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/hello-xor/198583254277577/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate});
  const xorTestSet = await models.TestSet.create({problemId: xorProblem.id, name: "TestSet1"});
  for (let testId = 0; testId < 10; testId++) {
    await models.Test.create({testSetId: xorTestSet.id, number: testId+1, description: `Test${testId+1}`, config: `{"id":${testId+1}}`, ...testLimits});
  }
  // General CPU
  {
    const generalCpuProblem = await models.Problem.create({name: "General Cpu", text: "See description in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/general-cpu/198587934277109/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  // General CPU v2
  {
    const generalCpuProblem = await models.Problem.create({name: "General Cpu v2", text: "See description in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/general-cpu-v2/203006817168554/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  // Find me
  {
    const generalCpuProblem = await models.Problem.create({name: "Find me", text: "See description in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/find-me/203685497100686/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  // Vote prediction
  {
    const generalCpuProblem = await models.Problem.create({name: "Vote prediction", text: "See description in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/vote-prediction/360055404797027/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  // MNIST
  {
    const generalCpuProblem = await models.Problem.create({name: "MNIST", text: "See description in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/mnist/198590804276822/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  // Die Hard
  {
    const generalCpuProblem = await models.Problem.create({name: "Die Hard", text: "See descripiton in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/die-hard/218888018913767/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  // BB8
  {
    const generalCpuProblem = await models.Problem.create({name: "BB8", text:"See description in the link below", textUrl: "https://www.facebook.com/notes/machine-learning-in-seconds-deep-learning-artificial-intelligence-ai/bb8/456173625185204/", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
    const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
    await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});
  }
  */

  // Create classes
  const basicClassName = 'Basic deep learning';
  const basicClassDescription = 'You need to know Python before you start this class. We will start with learning neural network, then we learn why deep neural network hard to learn and what to do with it, we learn how to make neural network to generalize'
  await models.Class.create({name: basicClassName, description: basicClassDescription, startAt: new Date("11/16/2019, 08:00:01 AM"), firstTaskDueAt: new Date("9/23/2019, 07:00:01 AM"), mentorId: roman.id});
  await models.Class.create({name: basicClassName, description: basicClassDescription, startAt: new Date("10/21/2019, 07:00:01 AM"), firstTaskDueAt: new Date("10/28/2019, 07:00:01 AM"), mentorId: roman.id});

  // Submit hello xor solution
  const romanToken = getTokenFromUser(roman);
  const context = await AppServer.getContextFromToken(romanToken);
  const testSets = await problem.getTestSets();
  const submitInput = {
    input: {
      problemId: getGlobalId(problem),
      testSetId: getGlobalId(testSets[0]),
      submissionCode: await getFile('/usr/src/problems/hello_xor_solution.py'),
    }
  }
  await resolvers.Mutation.submit(null, submitInput, context);

  console.log(`Admin token = ${getTokenFromUser(admin)}`);
  console.log(`Roman token = ${getTokenFromUser(roman)}`);
}