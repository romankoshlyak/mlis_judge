
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

  // Create classes
  const basicClassName = 'Basic deep learning';
  const basicClassDescription = 'You need to know Python before you start this class. We will start with learning neural network, then we learn why deep neural network hard to learn and what to do with it, we learn how to make neural network to generalize'
  await models.Class.create({name: basicClassName, description: basicClassDescription, startAt: new Date("09/16/2019, 08:00:01 AM"), firstTaskDueAt: new Date("09/23/2019, 07:00:01 AM"), mentorId: roman.id});
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