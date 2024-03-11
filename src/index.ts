import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import {uploadArtifact} from './uploadArtifact'
import {getTestAssemblies} from './getTestAssemblies'
import {getArguments} from './getArguments'
import {getVsTestPath} from './getVsTestPath'
import { get } from 'http';

export async function run() {
  try {
    let testFiles = await getTestAssemblies();
    if(testFiles.length == 0) {
      throw new Error('No matched test files!')
    }

    core.debug(`Matched test files are:`)
    testFiles.forEach(function (file) {
      core.debug(`${file}`)
    });

    // core.info(`Downloading test tools...`);
    // let workerZipPath = path.join(__dirname, 'win-x64.zip')
    // await exec.exec(`powershell Invoke-WebRequest -Uri "https://aka.ms/local-worker-win-x64" -OutFile ${workerZipPath}`);

    // core.info(`Unzipping test tools...`);
    // core.debug(`workerZipPath is ${workerZipPath}`);
    // await exec.exec(`powershell Expand-Archive -Path ${workerZipPath} -DestinationPath ${__dirname}`);

    let vsTestPath = getVsTestPath();
    core.info(`VsTestPath: ${vsTestPath}`);

    let args = getArguments();
    core.debug(`Arguments: ${args}`);

    core.info(`Running tests...`);
    let command = `"${vsTestPath}" ${testFiles.join(' ')} ${args} /Logger:TRX`;
    await exec.exec(command);
  } catch (err) {
    core.setFailed(err.message)
  }

  // Always attempt to upload test result artifact
  try {
    await uploadArtifact();
  } catch (err) {
    core.setFailed(err.message)
  }
}

run()