import fs from 'fs';
import models, { TestSet, Problem } from './models';
import { assertTrue} from './utils';

const DIR_NAME = '/usr/src/mlis-pytorch/mlis/problems/';
async function getFile(fileName: string) {
  return (await fs.promises.readFile(fileName)).toString();
}
async function getConfigList() {
  const configList = [
    'tutorial.json',
    'hello_xor.json',
    'general_cpu.json',
    'general_cpu_v2.json',
    'find_me.json',
    'vote_prediction.json',
    'mnist.json',
    'die_hard.json',
    'bb8.json',
    'hola.json',
  ];
  return configList.map(x => DIR_NAME + x);;
}
interface TestLimits {
  modelSizeLimit: number;
  trainingStepsLimit: number;
  trainingTimeLimit: number;
  evaluationTimeLimit: number;
  trainAccuracyLimit: number;
  testAccuracyLimit: number;
}
interface Test {
  number: number;
  description: string;
  dataProviderConfig: any;
  limits: TestLimits | null;
}
interface TestSetConfig {
  name: string;
  metrics: string[];
  limits: TestLimits | null;
  tests: Test[];
}
interface ProblemConfig {
  name: string;
  text: string;
  textUrl: string;
  dataProviderFile: string;
  codeTemplateFile: string;
  testSets: TestSetConfig[];
}
async function createMetrics(testSet: TestSet, metrics: string[]) {
  for (let index = 0; index < metrics.length; index++) {
    const metricType = metrics[index];
    const metric = await models.Metric.create(
      {
        testSetId: testSet.id,
        priority: index,
        type: metricType
      }
    );
    assertTrue(metric.id != null);
  }
}
async function loadProblemFromConfig(config: ProblemConfig) {
  const dataProvider = await getFile(DIR_NAME + config.dataProviderFile);
  const codeTemplate = await getFile(DIR_NAME + config.codeTemplateFile);
  const problem = await models.Problem.create({name: config.name, text: config.text, textUrl: config.textUrl, dataProvider: dataProvider, codeTemplate: codeTemplate});
  for (const testSetConfig of config.testSets) {
    const testSet = await models.TestSet.create({problemId: problem.id, name: testSetConfig.name});
    await createMetrics(testSet, testSetConfig.metrics);
    const testSetLimits = testSetConfig.limits;
    for (const testConfig of testSetConfig.tests) {
      testConfig.limits = testConfig.limits || testSetLimits;
      const testConfigJson = JSON.stringify(testConfig);
      const limits = testConfig.limits;
      await models.Test.create({testSetId: testSet.id, number: testConfig.number, description: testConfig.description, config: testConfigJson, ...limits});
    }
  }
  return problem;
}
export async function updateProblemFromConfigFile(configFile: string, problem: Problem) {
  const configJson = await getFile(DIR_NAME + configFile);
  const config = JSON.parse(configJson);
  //const dataProvider = await getFile(DIR_NAME + config.dataProviderFile);
  //const codeTemplate = await getFile(DIR_NAME + config.codeTemplateFile);
  //const problem = await models.Problem.create({name: config.name, text: config.text, textUrl: config.textUrl, dataProvider: dataProvider, codeTemplate: codeTemplate});
  const testSets = await problem.getTestSets();
  if (testSets.length != config.testSets.length) {
    throw "More then one test set";
  }
  const testSet = testSets[0];
  const testSetConfig = config.testSets[0];
  const tests = await testSet.getTests();
  const testsConfig = testSetConfig.tests;
  if (tests.length != testsConfig.length) {
    throw "Different number of tests";
  }
  const testSetLimits = testSetConfig.limits;
  for (const testConfig of testsConfig) {
    testConfig.limits = testConfig.limits || testSetLimits;
    const testConfigJson = JSON.stringify(testConfig);
    const testToUpdate = tests.filter(t => t.number == testConfig.number)[0];
    if (testToUpdate.config != testConfigJson) {
      console.log("Updating test config");
      testToUpdate.config = testConfigJson;
      testToUpdate.save();
    }
  }
}
export async function loadProblemFromConfigFile(configFile: string) {
  const configJson = await getFile(DIR_NAME + configFile);
  const config = JSON.parse(configJson);
  const problem = await loadProblemFromConfig(config);
  return problem;
}
export default async function loadProblemsFromConfigs() {
  let helloXorProblem = null;
  const configList = await getConfigList();
  for (const configFile of configList) {
    const problem = await loadProblemFromConfigFile(configFile);
    if (problem.name == "Hello Xor") {
      helloXorProblem = problem;
    }
  }
  return helloXorProblem;
}