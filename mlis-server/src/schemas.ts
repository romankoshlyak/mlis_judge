import { gql } from 'apollo-server';

export default gql`
  interface Node {
    id: ID!
  }
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  type User implements Node {
    id: ID!
    name: String!
    email: String!
  }
  type Test implements Node {
    id: ID!
    testSet: TestSet!
    description: String!
    config: String!
  }
  type TestEdge {
    node: Test!
    cursor: String!
  }
  type TestConnection {
    pageInfo: PageInfo!
    edges: [TestEdge]
  }
  type TestSet implements Node {
    id: ID!
    probelm: Problem!
    name: String!
    tests: TestConnection!
  }
  type TestSetEdge {
    node: TestSet!
    cursor: String!
  }
  type TestSetConnection {
    pageInfo: PageInfo!
    edges: [TestSetEdge]
  }
  type Problem implements Node {
    id: ID!
    name: String!
    text: String!
    dataProvider: String!
    submissions(after: String, first: Int, before: String, last: Int): SubmissionConnection!
    testSets(after: String, first: Int, before: String, last: Int): TestSetConnection!
  }
  enum RunStatus {
    SCHEDULED,
    RUNNING,
    FINISHED,
  }
  type TestRunReport implements Node {
    id: ID!
    status: RunStatus!
    problem: Problem!
    submission: Submission!
    test: Test!
  }
  type TestSetRunReport implements Node {
    id: ID!
    status: RunStatus!
    submission: Submission!
    testSet: TestSet!
    modelSizeMax: Float
    modelSizeMean: Float
    modelSizeMin: Float
    trainingStepsMax: Float
    trainingStepsMean: Float
    trainingStepsMin: Float
    trainingTimeMax: Float
    trainingTimeMean: Float
    trainingTimeMin: Float
    evaluationTimeMax: Float
    evaluationTimeMean: Float
    evaluationTimeMin: Float
    trainAccuracyMax: Float
    trainAccuracyMean: Float
    trainAccuracyMin: Float
    testAccuracyMax: Float
    testAccuracyMean: Float
    testAccuracyMin: Float
    isAccepted: Boolean
  }
  type SubmissionRunReport implements Node {
    id: ID!
    status: RunStatus!
    submission: Submission!
    testSetsRunReports: TestSet
  }
  type ProblemEdge {
    node: Problem
    cursor: String!
  }
  type ProblemConnection {
    pageInfo: PageInfo!
    edges: [ProblemEdge]
  }
  type Task implements Node {
    id: ID!
    attempt: Int!
    testRunReport: TestRunReport!
  }
  type Submission implements Node {
    id: ID!
    problem: Problem!
    owner: User!
    code: String!
    testSetRunReport: TestSetRunReport!
  }
  type SubmissionEdge {
    node: Submission!
    cursor: String!
  }
  type SubmissionConnection {
    pageInfo: PageInfo!
    edges: [SubmissionEdge!]!
  }
  type AdminViewer {
    user: User!
    problems(after: String, first: Int, before: String, last: Int): ProblemConnection
  }
  type Admin {
    viewer: AdminViewer
  }
  type Viewer {
    user: User!
    submission(id: ID!): Submission!
    problem(id: ID!): Problem!
    problems(after: String, first: Int, before: String, last: Int): ProblemConnection
  }
  type Main {
    viewer: Viewer
  }
  type Query {
    admin: Admin
    main: Main!
  }
  input SubmitInput {
    problemId: ID!
    testSetId: ID!
    submissionCode: String!
    clientMutationId: String
  }
  type SubmitPayload {
    submissionEdge: SubmissionEdge!
    clientMutationId: String
  }

  input GetTaskInput {
    clientMutationId: String
  }
  type GetTaskPayload {
    task: Task
    clientMutationId: String
  }
  input TaskRunResult {
    modelSize: Int!
    trainingSteps: Int!
    trainingTime: Float!,
    evaluationTime: Float!,
    trainError: Float!,
    trainCorrect: Float,
    trainTotal: Float,
    trainAccuracy: Float,
    trainMetric: Float,
    testError: Float!,
    testCorrect: Float,
    testTotal: Float,
    testAccuracy: Float,
    testMetric: Float,
  }
  input SaveTaskRunReportInput {
    taskId: ID!
    taskAttempt: Int!
    result: TaskRunResult
    stdOut: String
    stdErr: String
    clientMutationId: String
  }

  type SaveTaskRunReportPayload {
    clientMutationId: String
  }

  input AddProblemInput {
    text: String!
    clientMutationId: String
  }
  type AddProblemPayload {
    problemEdge: ProblemEdge!
    clientMutationId: String
  }
  input ChangeProblemInput {
    id: ID!
    text: String!
    clientMutationId: String
  }
  type ChangeProblemPayload {
    problem: Problem!
    clientMutationId: String
  }
  input RemoveProblemInput {
    id: ID!
    clientMutationId: String
  }
  type RemoveProblemPayload {
    removedProblemId: ID!
    clientMutationId: String
  }
  enum AuthType {
    FB_TOKEN,
    CRYPTO_TOKEN,
  }
  input LoginInput {
    authType: AuthType!
    token: String!
    clientMutationId: String
  }
  type LoginPayload {
    authorization: String!
    clientMutationId: String
  }
  type Mutation {
    loginOld(authType: String!, accessToken: String!): String!
    login(input: LoginInput): LoginPayload!
    submit(input: SubmitInput!): SubmitPayload!

    adminGetTask(input: GetTaskInput!): GetTaskPayload!
    adminSaveTaskRunReport(input: SaveTaskRunReportInput!): SaveTaskRunReportPayload!
    adminAddProblem(input: AddProblemInput!): AddProblemPayload!
    adminChangeProblem(input: ChangeProblemInput!): ChangeProblemPayload!
    adminRemoveProblem(input: RemoveProblemInput!): RemoveProblemPayload!
  }
  type Subscription {
    taskAdded: String!
    testSetRunReportChanged(id: ID!): TestSetRunReport!
  }
`