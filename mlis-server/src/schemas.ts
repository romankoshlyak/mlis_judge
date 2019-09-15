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
    number: Int!
    description: String!
    config: String!

    modelSizeLimit: Float
    trainingStepsLimit: Float
    trainingTimeLimit: Float
    evaluationTimeLimit: Float
    trainAccuracyLimit: Float
    testAccuracyLimit: Float

    testSet: TestSet!
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
    problem: Problem!
    name: String!
    tests: TestConnection!
  }
  type TestSetEdge {
    node: TestSet!
    cursor: String!
  }
  type TestSetConnection {
    pageInfo: PageInfo!
    edges: [TestSetEdge!]!
  }
  type Ranking implements Node {
    id: ID!
    problem: Problem!
    submission: Submission!
    user: User!
    metric: Float!
    updatedAt: Float!
  }
  type RankingEdge {
    node: Ranking!
    cursor: String!
  }
  type RankingConnection {
    pageInfo: PageInfo!
    edges: [RankingEdge!]!
  }
  type GlobalRanking {
    user: User!
    points: Int!
  }
  type GlobalRankingEdge {
    node: GlobalRanking!
    cursor: String!
  }
  type GlobalRankingConnection {
    pageInfo: PageInfo!
    edges: [GlobalRankingEdge!]!
  }
  type Problem implements Node {
    id: ID!
    name: String!
    text: String!
    codeTemplate: String!
    dataProvider: String!
    submissions(after: String, first: Int, before: String, last: Int): SubmissionConnection!
    testSets(after: String, first: Int, before: String, last: Int): TestSetConnection!
    ranking(after: String, first: Int, before: String, last: Int): RankingConnection!
  }
  enum RunStatus {
    SCHEDULED,
    RUNNING,
    FINISHED,
  }
  type TestRunReport implements Node {
    id: ID!
    status: RunStatus!
    stdErr: String
    stdOut: String
    isAccepted: Boolean
    rejectReason: String

    modelSize: Float
    trainingSteps: Float
    trainingTime: Float
    evaluationTime: Float
    trainError: Float
    trainCorrect: Float
    trainTotal: Float
    trainAccuracy: Float
    trainMetric: Float
    testError: Float
    testCorrect: Float
    testTotal: Float
    testAccuracy: Float
    testMetric: Float

    problem: Problem!
    submission: Submission!
    test: Test!
  }
  type TestRunReportEdge {
    node: TestRunReport!
    cursor: String!
  }
  type TestRunReportConnection {
    pageInfo: PageInfo!
    edges: [TestRunReportEdge!]!
  }
  type TestSetRunReport implements Node {
    id: ID!
    status: RunStatus!
    submission: Submission!
    testSet: TestSet!
    testRunReports(after: String, first: Int, before: String, last: Int): TestRunReportConnection!
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
    globalRanking(after: String, first: Int, before: String, last: Int): GlobalRankingConnection
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
  input LogoutInput {
    clientMutationId: String
  }
  type LogoutPayload {
    clientMutationId: String
  }
  type Mutation {
    login(input: LoginInput!): LoginPayload!
    logout(input: LogoutInput!): LogoutPayload!
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
    testRunReportChanged(id: ID!): TestRunReport!
  }
`