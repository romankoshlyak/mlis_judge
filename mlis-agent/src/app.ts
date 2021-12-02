import fs, { exists } from 'fs';
import { spawn } from 'child_process';
import util from 'util';
import { Docker } from 'node-docker-api';
import AgentEnvironment from './Environment';
import { DisconnectedError} from './Environment';
import { observeOne, assertTrue } from './utis';
import { Container } from 'node-docker-api/lib/container';

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const loginQuery = `
  mutation LoginQuery($input: LoginInput!) {
    login(input: $input) {
      authorization
      clientMutationId
    }
  }
`;

function loginVariables(token: string) {
  const authType = "CRYPTO_TOKEN";
  return {
    input: {
      authType,
      token,
    }
  }
};

const taskAddedSubscription = `
  subscription TaskAddedSubscription{
    taskAdded
  }
`;

const taskAddedVariables = {};

const getTaskQuery = `
  mutation GetTask($input: GetTaskInput!) {
    adminGetTask(input: $input) {
      task {
        id
        attempt
        testRunReport {
          problem {
            dataProvider
          }
          submission {
            code
          }
          test {
            config
          }
        }
      }
      clientMutationId
    }
  }
`;

const getTaskVariables = {
  input: {
    clientMutationId: 'clientMutationId'
  },
};

const saveTaskRunReportQuery = `
  mutation SaveTaskRunReport($input: SaveTaskRunReportInput!) {
    adminSaveTaskRunReport(input: $input) {
      clientMutationId
    }
  }
`;

function saveTaskRunReportVariables(taskId: string, taskAttempt: number, result: any, stdOut: string | null, stdErr: string | null, clientMutationId: string) {
  return {
    input: {
      taskId: taskId,
      taskAttempt: taskAttempt,
      result: result,
      stdOut: stdOut,
      stdErr: stdErr,
      clientMutationId: clientMutationId,
    }
  }
};

function executeWithCallback(baseDir: string, command: string, args: string[], callback: (err: Error | null, result: (string |number)[]) => void) {
  const ls = spawn(command, args, {
      cwd: baseDir,
  });
  ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  ls.on('close', (code, signal) => {
    callback(null, [code, signal]);
  });
  ls.on('error', (err) => {
    console.log('Err:', err);
  });
}

async function exec(baseDir: string, command: string, args: string[]) {
  const task = util.promisify(executeWithCallback);
  return await task(baseDir, command, args);
}
async function copyFromContainer(container: Container, fromPath: string, toPath: string) {
  const promisifyStream = (stream:any) => new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
  const stream:any = await container.fs.get({ path: fromPath})
  const file = fs.createWriteStream(toPath);
  stream.pipe(file)
  await promisifyStream(stream);
}
async function copyToContainer(container: Container, fromPath: string, toPath: string) {
  const promisifyStream = (stream:any) => new Promise((resolve, reject) => {
    stream.on('data', (d:any) => {});
    stream.on('end', resolve)
    stream.on('error', reject)
  })
  const stream:any = await container.fs.put(fromPath as any, { path: toPath });
  await promisifyStream(stream);
}
/*
    return _container.fs.put('./file.tar', {
      path: 'root'
    })
  })
  .then((stream) => promisifyStream(stream))
*/

async function executeSubmission(task: any) {
  const submissionTempDir = await fs.promises.mkdtemp('/tmp/submission');
  const dataProviderName = 'data_provider.py';
  const submisssionName = 'solution.py';
  const testConfigFileName = 'test.config';
  const testResultFileName = 'test.result';
  const stdOutName = 'std.out';
  const stdErrName = 'std.err';
  const submissionDirName = 'submission';
  const dataProviderFile = `${submissionTempDir}/${submissionDirName}/${dataProviderName}`;
  const submissionFile = `${submissionTempDir}/${submissionDirName}/${submisssionName}`;
  const testConfigFileLocal = `${submissionTempDir}/${submissionDirName}/${testConfigFileName}`;
  const ENCODING = 'utf8';

  const docker = new Docker({ socketPath: '/var/run/docker.sock' });
  let container = await docker.container.create({
    Image: 'mlis_pytorch',
    Cmd: [ './mlis/submission/runner.sh' ],
  });

  await copyFromContainer(container, '/usr/src/app/mlis/tester', `${submissionTempDir}/tester.tar`);
  await exec(submissionTempDir, 'tar', ['-xf', 'tester.tar']);
  await exec(submissionTempDir, 'mv', ['tester', 'submission']);
  await fs.promises.writeFile(dataProviderFile, task.testRunReport.problem.dataProvider);
  await fs.promises.writeFile(submissionFile, task.testRunReport.submission.code);
  await fs.promises.writeFile(testConfigFileLocal, task.testRunReport.test.config);
  await exec(submissionTempDir, 'tar', ['-cf', 'submission.tar', 'submission']);
  await copyToContainer(container, `${submissionTempDir}/submission.tar`, '/usr/src/app/mlis/');
  container = await container.start();
  let containerRunning = true;
  let timedOut = false;
  setTimeout(async () => {
    if (containerRunning) {
      timedOut = true;
      await container.kill();
      console.log('killed');
    }
  }, 5000);
  const {Error, StatusCode} = (await container.wait()) as any;
  containerRunning = false;
  assertTrue(Error == null);
  const stream:any = await container.logs({
    follow: true,
    stdout: true,
    stderr: true
  });
  stream.on('data', (info:any) => console.log('Info', info.toString()));
  stream.on('error', (err:any) => console.log('Err', err.toString()));

  const resultTempDir = await fs.promises.mkdtemp('/tmp/result');
  await copyFromContainer(container, '/usr/src/app/mlis/submission', `${resultTempDir}/submission.tar`);
  await exec(resultTempDir, 'tar', ['-xf', 'submission.tar']);
  const testResultFile = `${resultTempDir}/${submissionDirName}/${testResultFileName}`;
  const stdOutFile = `${resultTempDir}/${submissionDirName}/${stdOutName}`;
  const stdErrFile = `${resultTempDir}/${submissionDirName}/${stdErrName}`;
  let result = null;
  let stdOut = null;
  let stdErr = null;
  if (timedOut) {
    stdErr = 'Time out: killed';
  } else {
    if (await util.promisify(fs.exists)(testResultFile)) {
      result = await fs.promises.readFile(testResultFile, {encoding:ENCODING});
    }
    if (await util.promisify(fs.exists)(stdOutFile)) {
      stdOut = await fs.promises.readFile(stdOutFile, {encoding:ENCODING});
    }
    if (await util.promisify(fs.exists)(stdErrFile)) {
      stdErr = await fs.promises.readFile(stdErrFile, {encoding:ENCODING});
    }
    if (result != null) {
      try {
        result = JSON.parse(result);
      } catch (e) {
        console.log(e);
        result = null;
      }
    }
  }
  // Remove temp dirs
  await exec(submissionTempDir, 'rm', ['-rf', submissionTempDir]);
  await exec(resultTempDir, 'rm', ['-rf', resultTempDir]);
  // Remove container
  await container.delete();
  console.log({result, stdOut, stdErr});
  return {result, stdOut, stdErr}
}

export default async function app() {
  const adminToken = process.env.ADMIN_TOKEN as string;
  const url = process.env.GRAPHQL_URL as string;
  while (true) {
    let environment = AgentEnvironment.createNew(url);
    try {
      const loginResult = await observeOne(environment.request(loginQuery, loginVariables(adminToken)));
      assertTrue(loginResult.data.login.authorization.length > 0)
      const taskAddedNotifivationPromise = observeOne(environment.request(taskAddedSubscription, taskAddedVariables));
      const taskObj = await observeOne(environment.request(getTaskQuery, getTaskVariables));
      if (taskObj.data.adminGetTask.task == null) {
        const waitingTime = 60 * 60;
        const timeoutPromise = new Promise((res) => setTimeout(() => res("timeout"), waitingTime * 1000));
        console.log(`Wating for a task for ${waitingTime} seconds ...`);
        const res = await Promise.race([ taskAddedNotifivationPromise, timeoutPromise]);
        console.log(`Waiting res = ${res}`)
      } else {
        const task = taskObj.data.adminGetTask.task;
        environment.dispose();
        console.log(`Executing task = ${task.id}`);
        const response = await executeSubmission(task);
        environment = AgentEnvironment.createNew(url);
        const svaeTaskVariables = saveTaskRunReportVariables(task.id, task.attempt, response.result, response.stdOut, response.stdErr, 'id')
        const reportObj = await observeOne(environment.request(saveTaskRunReportQuery, svaeTaskVariables));
      }
    } catch (e) {
      if (e instanceof DisconnectedError) {
        console.log('Connection to server lost');
      } else {
        console.error('Unexpected error', e);
      }
      const waitingTime = 10;
      console.log(`Wating for ${waitingTime} seconds...`);
      await sleep(waitingTime * 1000);
    }
    environment.dispose();
  }
}