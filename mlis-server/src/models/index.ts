import { Sequelize, Model, DataTypes, HasManyGetAssociationsMixin, QueryTypes } from 'sequelize';
import { HasOneGetAssociationMixin } from 'sequelize';

const sequelize = new Sequelize('mlis', 'mlis', 'mlis', {
  host: 'database',
  dialect: 'postgres',
  logging: false,
});

export class Ranking extends Model {
  public id!: number;
  public problemId!: number;
  public userId!: number;
  public submissionId!: number;
  public metric!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUser!: HasOneGetAssociationMixin<User>;
}
export async function getGlobalRanking() {
  const res = await sequelize.query(`
    SELECT c."userId" as "userId", SUM(c."points") as "points"
    FROM (
      SELECT a."problemId" as "problemId", a."userId" as "userId", GREATEST(1000-count(b."metric"), 0) as points
      FROM rankings a
      LEFT OUTER JOIN rankings b
      ON a."problemId" = b."problemId" AND b."metric" < a."metric"
      GROUP BY a."problemId", a."userId"
    ) c
    GROUP BY c."userId"
    ORDER BY "points" DESC;
    `,
    { type: QueryTypes.SELECT }
  );
  return res;
}

Ranking.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },
  problemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  submissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  metric: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'rankings',
});

export class Submission extends Model {
  public id!: number;
  public testSetRunReportId!: number;
  public code!: string;
  public ownerId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getProblem!: HasOneGetAssociationMixin<Problem>;
  public getTestSetRunReport!: HasOneGetAssociationMixin<TestSetRunReport>;
}

Submission.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },
  problemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testSetRunReportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  code: {
    type: new DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'submissions',
});

export class Problem extends Model {
  public id!: number;
  public name!: string;
  public text!: string;
  public codeTemplate!: string;
  public dataProvider!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getSubmissions!: HasManyGetAssociationsMixin<Submission>;
  public getTestSets!: HasManyGetAssociationsMixin<TestSet>;
  public getRankings!: HasManyGetAssociationsMixin<Ranking>;
}

Problem.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: new DataTypes.TEXT,
    allowNull: false,
  },
  codeTemplate: {
    type: new DataTypes.TEXT,
    allowNull: false,
  },
  dataProvider: {
    type: new DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'problems',
});

export class Test extends Model {
  public id!: number;
  public number!: number;
  public description!: string;
  public config!: string;
  // Limits
  public modelSizeLimit!: number;
  public trainingStepsLimit!: number;
  public trainingTimeLimit!: number;
  public evaluationTimeLimit!: number;
  public trainAccuracyLimit!: number;
  public testAccuracyLimit!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Test.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
  config: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
  modelSizeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  trainingStepsLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  trainingTimeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  evaluationTimeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  trainAccuracyLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  testAccuracyLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'tests',
});

export class TestSet extends Model {
  public id!: number;
  public problemId!: number;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TestSet.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  problemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'test_sets',
});

export class TestRunReport extends Model {
  public id!: number;
  public status!: string;
  public stdErr!: string;
  public stdOut!: string;
  public modelSize!: number;
  public trainingSteps!: number;
  public trainingTime!: number;
  public evaluationTime!: number;
  public trainError!: number;
  public trainCorrect!: number;
  public trainTotal!: number;
  public trainAccuracy!: number;
  public trainMetric!: number;
  public testError!: number;
  public testCorrect!: number;
  public testTotal!: number;
  public testAccuracy!: number;
  public testMetric!: number;
  public testSetRunReportId!: number;

  public isAccepted!: boolean;
  public rejectReason!: string;

  public problemId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getTestSetRunReport!: HasOneGetAssociationMixin<TestSetRunReport>;
  public getProblem!: HasOneGetAssociationMixin<Problem>;
  public getTest!: HasOneGetAssociationMixin<Test>;
  public getSubmission!: HasOneGetAssociationMixin<Submission>;
}

TestRunReport.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
  stdOut: {
    type: new DataTypes.TEXT,
    allowNull: true,
  },
  stdErr: {
    type: new DataTypes.TEXT,
    allowNull: true,
  },
  modelSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trainingSteps: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trainingTime: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  evaluationTime: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainError: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainCorrect: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trainTotal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trainAccuracy: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainMetric: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testError: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testCorrect: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  testTotal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  testAccuracy: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testMetric: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  isAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  rejectReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  problemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  submissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testSetRunReportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'test_run_reports',
});

export class TestSetRunReport extends Model {
  public id!: number;
  public status!: string;

  public modelSizeMax!: number;
  public modelSizeMean!: number;
  public modelSizeMin!: number;
  public trainingStepsMax!: number;
  public trainingStepsMean!: number;
  public trainingStepsMin!: number;
  public trainingTimeMax!: number;
  public trainingTimeMean!: number;
  public trainingTimeMin!: number;
  public evaluationTimeMax!: number;
  public evaluationTimeMean!: number;
  public evaluationTimeMin!: number;
  public trainAccuracyMax!: number;
  public trainAccuracyMean!: number;
  public trainAccuracyMin!: number;
  public testAccuracyMax!: number;
  public testAccuracyMean!: number;
  public testAccuracyMin!: number;

  public isAccepted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async getFailedTestRunReports() {
    return [];
  }

  public getTestRunReports!: HasManyGetAssociationsMixin<TestRunReport>;
}

TestSetRunReport.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
  trainAccuracyMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainAccuracyMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainAccuracyMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  modelSizeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  modelSizeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  modelSizeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  evaluationTimeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  evaluationTimeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  evaluationTimeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  isAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'test_set_run_reports',
});

export class Task extends Model {
  public id!: number;
  public status!: string;
  public attempt!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getTestRunReport!: HasOneGetAssociationMixin<TestRunReport>;
}

Task.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
  attempt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testRunReportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'tasks',
});

export class User extends Model {
  public id!: number;
  public fbId!: string;
  public email!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fbId: {
    type: new DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  email: {
    type: new DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: new DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'users',
  indexes: [
    // Create a unique index on email
    {
      unique: true,
      fields: ['fbId']
    },
  ],
});
Submission.hasOne(Problem, {foreignKey: 'id', sourceKey: 'problemId', constraints: false});
Submission.hasOne(TestSetRunReport, {foreignKey: 'id', sourceKey: 'testSetRunReportId', constraints: false});
TestRunReport.hasOne(TestSetRunReport, {foreignKey: 'id', sourceKey: 'testSetRunReportId', constraints: false});
TestRunReport.hasOne(Problem, {foreignKey: 'id', sourceKey: 'problemId', constraints: false});
TestRunReport.hasOne(Test, {foreignKey: 'id', sourceKey: 'testId', constraints: false});
TestRunReport.hasOne(Submission, {foreignKey: 'id', sourceKey: 'submissionId', constraints: false});
Task.hasOne(TestRunReport, {foreignKey: 'id', sourceKey: 'testRunReportId', constraints: false});
Problem.hasMany(Submission, {foreignKey: 'problemId'});
Problem.hasMany(TestSet, {foreignKey: 'problemId'});
Problem.hasMany(Ranking, {foreignKey: 'problemId'});
User.hasMany(Submission, {foreignKey: "ownerId"})
TestSet.hasMany(Test, {foreignKey: "testSetId"})
TestSetRunReport.hasMany(TestRunReport, {foreignKey: "testSetRunReportId"})
Ranking.hasOne(User, {foreignKey: 'id', sourceKey: 'userId', constraints: false});

export default {User, Test, TestSet, TestRunReport, TestSetRunReport, Task, Ranking, Problem, Submission, getGlobalRanking, sequelize};