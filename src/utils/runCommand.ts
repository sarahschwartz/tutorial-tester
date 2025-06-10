import type { Page } from '@playwright/test';
import { exec } from 'node:child_process';
import { clickCopyButton } from './button';
import fs from 'fs';
import { join } from 'path';
import os from 'os';
import { spawn } from 'node-pty';
import { expect } from '@playwright/test';

export async function runCommand(
  page: Page,
  debugMode: boolean,
  buttonName: string,
  goToFolder: string = 'tests-output',
  projectFolder: string = 'hardhat-project',
  waitTime?: number,
  preCommand?: string,
  useSetCommand?: string,
  prompts?: string,
  saveOutput?: string,
  checkForOutput?: string,
  expectError?: string,
  replaceString?: string
) {
  const thisWaitTime = waitTime ? waitTime : prompts ? 35000 : 12000;
  console.log('WAIT TIME', thisWaitTime);
  let command = useSetCommand;
  if (!command) {
    command = await clickCopyButton(page, buttonName);
    console.log('COPIED', command);
  }
  if (replaceString) {
    const split = replaceString.split('|');
    split.forEach((replaceString) => {
      const splitReplace = replaceString.split(':');
      const first = splitReplace[0];
      const second = splitReplace[1];
      if(!first || !second) {
        throw new Error(`Invalid replaceString format: ${replaceString}. Expected format is 'oldValue:newValue'.`);
      }
      command = command?.replace(first, second);
    });
  }
  const copied = command;
  const newHardhatProject = command.includes('npx hardhat init');

  if (newHardhatProject) {
    await createNewHHProject(goToFolder, projectFolder);
  } else {
    if (preCommand) {
      if (preCommand.includes('<COMMAND>')) {
        command = preCommand.replace('<COMMAND>', copied.trimEnd());
      } else {
        command = preCommand + copied;
      }
    }

    if (goToFolder) {
      command = `cd ${goToFolder} && ${command}`;
    }

    if (prompts || debugMode) {
      await runWithPrompts(command, prompts);
    } else {
      await run(command, saveOutput, checkForOutput, expectError);
    }
    await page.waitForTimeout(thisWaitTime);
    console.log(`waited ${thisWaitTime / 1000} seconds`);
  }
}

async function run(command: string, saveOutput?: string, checkForOutput?: string, expectError?: string): Promise<void> {
  console.log('RUNNING COMMAND:', command);

  return new Promise<void>((resolve, reject) => {
    exec(command, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        if (expectError) {
          console.log('EXPECT ERROR', expectError);
          const hasError = [error.message, stdout, stderr].some((message) => message.includes(expectError));
          console.log('HAS ERROR', hasError);
          if (hasError) {
            resolve();
          } else {
            console.log('ERROR:', error);
            reject(new Error('Unexpected error: ' + error.message));
          }
        } else {
          console.log('ERROR:', error);
          reject(new Error('Unexpected error: ' + error.message));
        }
      } else {
        if (checkForOutput) {
          expect(stdout).toContain(checkForOutput);
          console.log('✅ FOUND OUTPUT:', checkForOutput);
        }

        if (saveOutput && stdout) {
          fs.writeFileSync(saveOutput, stdout);
        }

        resolve();
      }
    });
  });
}

async function createNewHHProject(goToFolder: string, projectFolder: string) {
  const repoDir = 'hardhat';
  if (!fs.existsSync(join(goToFolder, repoDir))) {
    const command = `cd ${goToFolder} && git clone https://github.com/NomicFoundation/hardhat.git`;
    await run(command);
  }
  const folderToCopy = 'packages/hardhat-core/sample-projects/typescript';

  const sourceFolder = join(goToFolder, repoDir, folderToCopy);
  const destinationFolder = join(goToFolder, projectFolder);
  copyFolder(sourceFolder, destinationFolder);
  const installCommand = `cd ${destinationFolder} && npm init -y && npm install --save-dev "hardhat@latest" "@nomicfoundation/hardhat-toolbox@^5.0.0" `;
  await run(installCommand);
}

function copyFolder(source: string, destination: string) {
  fs.mkdirSync(destination, { recursive: true });

  const copyRecursive = (src: string, dest: string) => {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      fs.readdirSync(src).forEach((item) => {
        copyRecursive(join(src, item), join(dest, item));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  copyRecursive(source, destination);
}

export async function runWithPrompts(command: string, prompts: string | undefined) {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  const ptyProcess = spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });

  let promptsArray: { prompt: string | undefined; answer: string | undefined }[];

  if(prompts){
    promptsArray = prompts.split('|').map((pair) => {
    const [prompt, answer] = pair.split(':');
    return { prompt, answer };
  });
}
let lastData = '';

  ptyProcess.onData((data) => {
    if(lastData !== data) console.log('DATA:', data);
    lastData = data;

    if(promptsArray && promptsArray.length > 0){
      for (let index = 0; index < promptsArray.length; index++) {
        const promptObject = promptsArray[index];
        if (promptObject && promptObject.prompt && data.includes(promptObject.prompt)) {
          console.log('FOUND PROMPT:', promptObject.prompt);
          ptyProcess.write(promptObject.answer + '\r');
        }
      }
    }
  });

  ptyProcess.write(command + '\r');
}
