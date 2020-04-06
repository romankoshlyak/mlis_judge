import fs from 'fs';
import jwt from 'jsonwebtoken';
import { fromGlobalId } from 'graphql-relay';
import { PubSub } from 'graphql-subscriptions';
import { Express } from "express-serve-static-core";
import contentDisposition from 'content-disposition';

import AppContext from './context';
import models, { Test, Problem, Submission } from './models';
import { getModelId, requireValue, assertTrue } from './utils';

const ENCODING = 'utf8';
const MLIS_DIR_NAME = '/usr/src/mlis-pytorch/mlis/';
const MLIS_CORE_DIR_NAME = `${MLIS_DIR_NAME}core/`;
const MLIS_UTILS_DIR_NAME = `${MLIS_DIR_NAME}utils/`;
class None {
  toJson() {
    return "None";
  }
}
export default class DownloadServer {
  private pubsub: PubSub;
  public installDownloadHandler(app: Express) {
    const downloadServer = this;
    app.get('/download/notebook/problem/:problemId', async function(req, res) {
      const context = await downloadServer.getContext(req);
      const [fileName, fileContent] = await downloadServer.getNotebook(context, req.params.problemId);
      res.set({"Content-Disposition":`attachment; filename="${fileName}"`});
      res.send(fileContent);
    });
    app.get('/download/notebook/submission/:submissionId', async function(req, res) {
      const context = await downloadServer.getContext(req);
      let [fileName, fileContent] = await downloadServer.getNotebook(context, req.params.submissionId);
      res.set({"Content-Disposition": contentDisposition(fileName)});
      res.send(fileContent);
    });
  }

  private async fixProblemTemplate(context: AppContext) {
    const problemId = getModelId("UHJvYmxlbToy", Problem);
    const problem = requireValue(await Problem.findByPk(problemId));
    if (problem.name == "Hello Xor") {
      let notebookTemplate  = await fs.promises.readFile(`${MLIS_DIR_NAME}problems/hello_xor_code_template.py`, {encoding: ENCODING});
      console.log("before_check");
      if (problem.codeTemplate != notebookTemplate) {
        console.log("update");
        problem.codeTemplate = notebookTemplate;
        await problem.save();
      }
    }
  }

  private async getNotebook(context: AppContext, id: string): Promise<[string, string]> {
    await this.fixProblemTemplate(context);
    let notebookTemplate  = await fs.promises.readFile("./templates/notebook.ipynb_template", {encoding: ENCODING});
    const mlisCoreCodebase = await this.getCodeFromDir(MLIS_CORE_DIR_NAME);
    const mlisUtilsCodebase = await this.getCodeFromDir(MLIS_UTILS_DIR_NAME);
    let submission = null;
    let problem = null;
    const globalId = fromGlobalId(id);
    if (globalId.type === Problem.name) {
      problem = requireValue(await context.models.Problem.findByPk(globalId.id));
    } else if (globalId.type == Submission.name) {
      submission = requireValue(await context.models.Submission.findByPk(globalId.id));
      problem = await submission.getProblem();
    } else {
      assertTrue(false);
    }
    problem = requireValue(problem);
    const problemDataProvider = this.commentOutLocalImports(problem.dataProvider);
    let code = null;
    if (submission != null) {
      code = submission.code;
    } else {
      code = problem.codeTemplate;
    }
    const problemSolutionTemplate = this.commentOutLocalImports(code);
    const testSet = await this.getTestSet(problem);
    const config = `
Config.RuntimeName = 'notebook'
Config.DataProvider = DataProvider
Config.TestSet = TestSet`;
    const values = {
      'MLIS_CODEBASE': mlisCoreCodebase + mlisUtilsCodebase,
      'MLIS_PROBLEM_DATA_PROVIDER': testSet + '\n' + problemDataProvider + '\n' + config,
      'MLIS_PROBLEM_SOLUTION': problemSolutionTemplate
    };
    for (const [key, value] of Object.entries(values)) {
      notebookTemplate = notebookTemplate.replace(key, JSON.stringify(value));
    }

    const problemNameWithoutSpaces = this.replaceSpaces(problem.name);
    let submissionBy = '';
    if (submission != null) {
      const owner = await submission.getOwner();
      submissionBy = '_by_' + this.replaceSpaces(owner.name);
    }
    const fileName = `Problem_${problemNameWithoutSpaces}${submissionBy}_${id}.ipynb`;
    return [fileName, notebookTemplate];
  }
  private async getTestSet(problem: Problem) {
    const testSets = await problem.getTestSets();
    const testSet = testSets[0];
    const tests = await testSet.getTests();
    tests.map((test: Test) => test.config);

    const testSetConfig = {
      'name': testSet.name,
      'tests': tests.map((test) => JSON.parse(test.config)),
    }
    const testSetConfigString = JSON.stringify(testSetConfig, undefined, 4).replace(/null/g, 'None');
    return `TestSet = ${testSetConfigString}`;
  }

  private replaceSpaces(str: string) {
    return str.replace(/ /g, '_');
  }

  private commentOutLocalImports(code: string) {
    const commentedOutFileLines = [];
    for (const fileLine of code.split("\n")) {
      commentedOutFileLines.push(fileLine.replace("from .", "#from ."));
    }
    return commentedOutFileLines.join("\n");
  }

  private async getCodeFromDir(dirName: string) {
    const dirList = await fs.promises.readdir(dirName);
    const files = [];
    for (const file of dirList) {
        if (file.endsWith('.py')) {
          let fileText  = await fs.promises.readFile(`${dirName}${file}`, {encoding: ENCODING});
          const fullFileName = `# File: ${dirName}${file}`;
          const fileContent = this.commentOutLocalImports(fileText);
          files.push([fullFileName, fileContent].join('\n'));
        }
    }
    return files.join('\n\n');
  }
  private async getContext(req: any): Promise<AppContext> {
    let token: string | null = null;
    token = req.headers.authorization;
    const contextFromToken = await this.getContextFromToken(token);
    return {...contextFromToken};
  }

  public async getContextFromToken(token: string | null) {
    const jwtSecret = process.env.JWT_SECRET || '';
    let viewer = null;
    try {
      if (token != null) {
        const jwtInfo = <{user_id:number}> await jwt.verify(token, jwtSecret);
        viewer = await models.User.findByPk(jwtInfo.user_id);
      }
    } catch (error) {
      console.error(token, error);
    }

    const pubsub = this.pubsub;
    return { models, viewer, pubsub, connection: null };
  }
  public constructor() {
    this.pubsub = new PubSub();
  }
}