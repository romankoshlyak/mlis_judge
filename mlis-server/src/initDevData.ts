
import jwt from 'jsonwebtoken';
import fs from 'fs';
import models, { User } from './models';
import resolvers from './resolvers';
import AppServer from './AppServer';
import { getGlobalId } from './utils';

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

  const xorDataProvider = await getFile('./problems/hello_xor_data_provider.py');
  const xorCodeTemplate = await getFile('./problems/hello_xor_code_template.py');
  const xorProblem = await models.Problem.create({name: "Hello Xor", text: "You need to learn xor function", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate});
  const xorTestSet = await models.TestSet.create({problemId: xorProblem.id, name: "TestSet1"});
  const testLimits = {modelSizeLimit: 1000000.0, trainingStepsLimit: 1000000.0, trainingTimeLimit: 2.0, evaluationTimeLimit: 2.0, trainAccuracyLimit: 1.0, testAccuracyLimit: 1.0};
  for (let testId = 0; testId < 10; testId++) {
    await models.Test.create({testSetId: xorTestSet.id, number: testId+1, description: `Test${testId+1}`, config: `{"id":${testId+1}}`, ...testLimits});
  }
  const generalCpuProblem = await models.Problem.create({name: "General Cpu", text: "You need to learn general function", dataProvider: xorDataProvider, codeTemplate: xorCodeTemplate });
  const generalCpuTestSet = await models.TestSet.create({problemId: generalCpuProblem.id, name: "TestSet2"});
  await models.Test.create({testSetId: generalCpuTestSet.id, number: 1, description: "Test1", config: '{"id":1}', ...testLimits});
  await models.Test.create({testSetId: generalCpuTestSet.id, number: 2, description: "Test2", config: '{"id":2}', ...testLimits});

  // Submit hello xor solution
  const romanToken = getTokenFromUser(roman);
  const context = await AppServer.getContextFromToken(romanToken);
  const submitInput = {
    input: {
      problemId: getGlobalId(xorProblem),
      testSetId: getGlobalId(xorTestSet),
      submissionCode: await getFile('./problems/hello_xor_solution.py'),
    }
  }
  await resolvers.Mutation.submit(null, submitInput, context);

  console.log(`Admin token = ${getTokenFromUser(admin)}`);
  console.log(`Roman token = ${getTokenFromUser(roman)}`);
}