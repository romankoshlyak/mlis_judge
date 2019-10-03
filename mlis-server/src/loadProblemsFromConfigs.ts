import fs from 'fs';
import models, { TestSet } from './models';
import { assertTrue, requireValue } from './utils';
import { QueryTypes, Transaction, Transactionable } from 'sequelize';

const DIR_NAME = '/usr/src/problems/';
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
async function createMetrics(testSet: TestSet, metrics: string[], options: Transactionable = {}) {
  for (let index = 0; index < metrics.length; index++) {
    const metricType = metrics[index];
    const metric = await models.Metric.create(
      {
        testSetId: testSet.id,
        priority: index,
        type: metricType
      },
      options
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
export default async function loadProblemsFromConfigs() {
  let helloXorProblem = null;
  const configList = await getConfigList();
  for (const configFile of configList) {
    const configJson = await getFile(configFile);
    const config = JSON.parse(configJson);
    const problem = await loadProblemFromConfig(config);
    if (problem.name == "Hello Xor") {
      helloXorProblem = problem;
    }
  }
  return helloXorProblem;
}
async function isMigrateAddMetricsNeeded(transaction: Transaction) {
  const res = await models.sequelize.query(`
    SELECT
      COLUMN_NAME
    FROM
      information_schema.COLUMNS
    WHERE
      TABLE_NAME = 'rankings';
    `,
    {
      type: QueryTypes.SELECT,
      transaction
    }
  );
  const isMetricAdded = res.some((obj:any) => obj.column_name == 'metric1');
  return !isMetricAdded;
}
async function addMetricsTable(transaction: Transaction) {
  const res = await models.sequelize.query(`
--
-- Name: metrics; Type: TABLE; Schema: public; Owner: mlis
--

CREATE TABLE public.metrics (
    id integer NOT NULL,
    "testSetId" integer NOT NULL,
    priority integer NOT NULL,
    type character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.metrics OWNER TO mlis;

--
-- Name: metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: mlis
--

CREATE SEQUENCE public.metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.metrics_id_seq OWNER TO mlis;

--
-- Name: metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mlis
--

ALTER SEQUENCE public.metrics_id_seq OWNED BY public.metrics.id;

--
-- Name: metrics id; Type: DEFAULT; Schema: public; Owner: mlis
--

ALTER TABLE ONLY public.metrics ALTER COLUMN id SET DEFAULT nextval('public.metrics_id_seq'::regclass);

--
-- Name: metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: mlis
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);
--
-- Name: metrics metrics_testSetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mlis
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT "metrics_testSetId_fkey" FOREIGN KEY ("testSetId") REFERENCES public.test_sets(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `,
    {
      type: QueryTypes.RAW,
      transaction
    }
  );
}
async function addMetricsFromConfig(transaction: Transaction) {
  const configList = await getConfigList();
  for (const configFile of configList) {
    const configJson = await getFile(configFile);
    const config: ProblemConfig = JSON.parse(configJson);
    const savedProblem = requireValue(await models.Problem.findOne({
      where: {
        name: config.name
      },
      transaction
    }));
    const testSets = await savedProblem.getTestSets({transaction});
    assertTrue(testSets.length == 1);
    assertTrue(config.testSets.length == 1);
    const testSet = testSets[0];
    const testSetConfig = config.testSets[0];
    await createMetrics(testSet, testSetConfig.metrics, {transaction});
  }
}
async function addTestSetIdColumn(transaction: Transaction) {
  const res = await models.sequelize.query(`
  ALTER TABLE test_set_run_reports 
  ADD COLUMN "testSetId" integer;
    `,
    {
      type: QueryTypes.RAW,
      transaction
    }
  );
}
async function populateTestSetId(transaction: Transaction) {
  const reports = await models.TestSetRunReport.findAll({transaction});
  for (const report of reports) {
    const test_reports = await report.getTestRunReports({transaction});
    assertTrue(test_reports.length > 0);
    const test_report = test_reports[0];
    const test = await test_report.getTest({transaction})
    report.testSetId = test.testSetId;
    await report.save({transaction, silent:true});
  }
}
async function changeTestSetIdColumn(transaction: Transaction) {
  const res = await models.sequelize.query(`
ALTER TABLE test_set_run_reports
ALTER COLUMN "testSetId" SET NOT NULL;
    `,
    {
      type: QueryTypes.RAW,
      transaction
    }
  );
}
async function addMetricsToRankings(transaction: Transaction) {
  const res = await models.sequelize.query(`
ALTER TABLE rankings 
RENAME COLUMN metric TO metric1;
ALTER TABLE rankings
ADD COLUMN metric2 double precision;
ALTER TABLE rankings 
ADD COLUMN metric3 double precision;
    `,
    {
      type: QueryTypes.RAW,
      transaction
    }
  );
}
async function populateMetricsToRankings(transaction: Transaction) {
  const rankings = await models.Ranking.findAll({transaction});
  for (const ranking of rankings) {
    const submission = await ranking.getSubmission({transaction});
    const testSetRunReport = await submission.getTestSetRunReport({transaction});
    const [metric1, metric2, metric3] = await testSetRunReport.getMetricValuesForRanking({transaction});
    ranking.metric1 = requireValue(metric1);
    ranking.metric2 = metric2;
    ranking.metric3 = metric3;
    await ranking.save({transaction, silent:true});
  }
}
async function changeTestSetIdColumnOnTest(transaction: Transaction) {
  const res = await models.sequelize.query(`
ALTER TABLE tests
ALTER COLUMN "testSetId" SET NOT NULL;

ALTER TABLE ONLY public.tests
DROP CONSTRAINT "tests_testSetId_fkey";

ALTER TABLE ONLY public.tests
ADD CONSTRAINT "tests_testSetId_fkey" FOREIGN KEY ("testSetId") REFERENCES public.test_sets(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `,
    {
      type: QueryTypes.RAW,
      transaction
    }
  );
}
export async function migrateAddMetrics() {
  const transaction = await models.sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE});
  try {
    const isMigrationNeeded = await isMigrateAddMetricsNeeded(transaction);
    console.log("Do migration =", isMigrationNeeded);
    if (isMigrationNeeded) {
      console.log("Add metrics table");
      await addMetricsTable(transaction);
      console.log("Add metrics");
      await addMetricsFromConfig(transaction);
      console.log("Add testSetId column");
      await addTestSetIdColumn(transaction);
      console.log("Populate testSetId column");
      await populateTestSetId(transaction);
      console.log("Change testSetId column type")
      await changeTestSetIdColumn(transaction);
      console.log("Add metrics to rankings");
      await addMetricsToRankings(transaction);
      console.log("Populate metrics");
      await populateMetricsToRankings(transaction);
      console.log("Not null test set id on tests");
      await changeTestSetIdColumnOnTest(transaction);
    }
    transaction.commit();
  } catch (e) {
    await transaction.rollback()
    throw e;
  }
}