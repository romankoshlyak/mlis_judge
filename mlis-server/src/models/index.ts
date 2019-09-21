import { Sequelize, Model, DataTypes, HasManyGetAssociationsMixin, QueryTypes, HasManyCountAssociationsMixin } from 'sequelize';
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

export class Class extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public startAt!: Date;
  public firstTaskDueAt!: Date;
  public mentorId!: number;
  public getMentor!: HasOneGetAssociationMixin<User>;
  public getClassStudents!: HasManyGetAssociationsMixin<ClassStudent>;
  public countClassStudents!: HasManyCountAssociationsMixin;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Class.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  firstTaskDueAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'classes',
});

export class ClassStudent extends Model {
  public id!: number;
  public classId!: number;
  public studentId!: number;
  public isEleminated!: boolean;
  public getStudent!: HasOneGetAssociationMixin<User>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClassStudent.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isEleminated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'classStudents',
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
  public textUrl!: string;
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
  textUrl: {
    type: new DataTypes.TEXT,
    allowNull: true,
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
  public trainEvaluationTimeLimit!: number;
  public trainMetricLimit!: number;
  public trainAccuracyLimit!: number;
  public testEvaluationTimeLimit!: number;
  public testMetricLimit!: number;
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
    type: new DataTypes.TEXT,
    allowNull: false,
  },
  modelSizeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  trainEvaluationTimeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  trainMetricLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: true,
  },
  trainAccuracyLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: true,
  },
  testEvaluationTimeLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: false,
  },
  testMetricLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyLimit: {
    type: new DataTypes.DOUBLE,
    allowNull: true,
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
  public modelSize!: number | null;
  public trainingSteps!: number | null;
  public trainingTime!: number | null;
  public trainEvaluationTime!: number | null;
  public trainError!: number | null;
  public trainMetric!: number | null;
  public trainCorrect!: number | null;
  public trainTotal!: number | null;
  public trainAccuracy!: number | null;
  public testEvaluationTime!: number | null;
  public testError!: number | null;
  public testMetric!: number | null;
  public testCorrect!: number | null;
  public testTotal!: number | null;
  public testAccuracy!: number | null;
  public testSetRunReportId!: number | null;

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
  trainEvaluationTime: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainError: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainMetric: {
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
  testEvaluationTime: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testError: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testMetric: {
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

  public modelSizeMin!: number | null;
  public modelSizeMean!: number | null;
  public modelSizeMax!: number | null;
  public trainingStepsMin!: number | null;
  public trainingStepsMean!: number | null;
  public trainingStepsMax!: number| null;
  public trainingTimeMin!: number | null;
  public trainingTimeMean!: number | null;
  public trainingTimeMax!: number | null;
  public trainEvaluationTimeMin!: number | null;
  public trainEvaluationTimeMean!: number | null;
  public trainEvaluationTimeMax!: number | null;
  public trainMetricMin!: number | null;
  public trainMetricMean!: number | null;
  public trainMetricMax!: number | null;
  public trainAccuracyMin!: number | null;
  public trainAccuracyMean!: number | null;
  public trainAccuracyMax!: number | null;
  public testEvaluationTimeMin!: number | null;
  public testEvaluationTimeMean!: number | null;
  public testEvaluationTimeMax!: number | null;
  public testMetricMin!: number | null;
  public testMetricMean!: number | null;
  public testMetricMax!: number | null;
  public testAccuracyMin!: number | null;
  public testAccuracyMean!: number | null;
  public testAccuracyMax!: number | null;

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
  modelSizeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  modelSizeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  modelSizeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingStepsMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainingTimeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainEvaluationTimeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainEvaluationTimeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainEvaluationTimeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainMetricMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainMetricMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainMetricMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainAccuracyMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainAccuracyMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  trainAccuracyMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testEvaluationTimeMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testEvaluationTimeMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testEvaluationTimeMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testMetricMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testMetricMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testMetricMax: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyMin: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyMean: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  testAccuracyMax: {
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
Class.hasMany(ClassStudent, {foreignKey: 'classId'});
Class.hasOne(User, {as: 'mentor', foreignKey: 'id', sourceKey: 'mentorId', constraints: false});
ClassStudent.hasOne(User, {as: 'student', foreignKey: 'id', sourceKey: 'studentId', constraints: false});
ClassStudent.hasOne(Class, {foreignKey: 'id', sourceKey: 'classId', constraints: false});

export default {Class, ClassStudent, User, Test, TestSet, TestRunReport, TestSetRunReport, Task, Ranking, Problem, Submission, getGlobalRanking, sequelize};