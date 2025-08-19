import type { Page } from "@playwright/test";
import { exec } from "node:child_process";
import { clickCopyButton } from "./button";
import fs from "fs";
import { join } from "path";
import os from "os";
import { spawn } from "node-pty";
import { expect } from "@playwright/test";

export async function runCommand(
  page: Page,
  debugMode: boolean,
  dirPath: string,
  buttonName: string,
  goToFolder: string = "tests-output",
  projectFolder: string = "hardhat-project",
  waitTime?: number,
  preCommand?: string,
  useSetCommand?: string,
  prompts?: string,
  saveOutput?: string,
  checkForOutput?: string,
  expectError?: string,
  replaceString?: string,
  runFromSourceDir?: boolean
) {
  const thisWaitTime = waitTime ? waitTime : prompts ? 30000 : 10000;
  console.log("WAIT TIME", thisWaitTime);
  let command = useSetCommand;
  if (!command) {
    command = await clickCopyButton(page, buttonName);
    console.log("COPIED", command);
  }
  if (replaceString) {
    const split = replaceString.split("|");
    split.forEach((replaceString) => {
      const splitReplace = replaceString.split(":");
      const first = splitReplace[0];
      const second = splitReplace[1];
      if (!first || !second) {
        throw new Error(
          `Invalid replaceString format: ${replaceString}. Expected format is 'oldValue:newValue'.`
        );
      }
      command = command?.replace(first, second);
    });
  }
  const copied = command;
  const newHardhatProject = command.includes("npx hardhat init");

  if (newHardhatProject) {
    await createNewHHProject(goToFolder, projectFolder);
  } else {
    if (preCommand) {
      if (preCommand.includes("<COMMAND>")) {
        command = preCommand.replace("<COMMAND>", copied.trimEnd());
      } else {
        command = preCommand + copied;
      }
    }

    if (goToFolder) {
      command = `cd ${goToFolder} && ${command}`;
    }

    if (prompts) {
      await runWithPrompts(command, prompts);
    } else {
      const dir = runFromSourceDir ? dirPath : undefined;
      await run(
        command,
        saveOutput,
        checkForOutput,
        expectError,
        dir,
        debugMode
      );
    }
    await page.waitForTimeout(thisWaitTime);
    console.log(`waited ${thisWaitTime / 1000} seconds`);
  }
}

async function run(
  command: string,
  saveOutput?: string,
  checkForOutput?: string,
  expectError?: string,
  dir?: string,
  debugMode?: boolean
): Promise<void> {
  console.log("RUNNING COMMAND:", command);

  return new Promise<void>((resolve, reject) => {
    exec(
      command,
      {
        cwd: dir || process.cwd(),
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 10,
      },
      (error, stdout, stderr) => {
        if (error) {
          if (expectError) {
            console.log("EXPECT ERROR", expectError);
            const hasError = [error.message, stdout, stderr].some((message) =>
              message.includes(expectError)
            );
            console.log("HAS ERROR", hasError);
            if (hasError) {
              resolve();
            } else {
              console.log("ERROR:", error);
              reject(new Error("Unexpected error: " + error.message));
            }
          } else {
            console.log("ERROR:", error);
            reject(new Error("Unexpected error: " + error.message));
          }
        } else {
          if(debugMode) {
            console.log("STDOUT:", stdout);
            if(stderr) console.log("STDERR:", stderr);
          }
          if (checkForOutput) {
            expect(stdout).toContain(checkForOutput);
            console.log("✅ FOUND OUTPUT:", checkForOutput);
          }

          if (saveOutput && stdout) {
            fs.writeFileSync(saveOutput, stdout);
          }

          resolve();
        }
      }
    );
  });
}

async function createNewHHProject(goToFolder: string, projectFolder: string) {
  const repoDir = "hardhat";
  if (!fs.existsSync(join(goToFolder, repoDir))) {
    const command = `cd ${goToFolder} && git clone https://github.com/NomicFoundation/hardhat.git`;
    await run(command);
  }
  const folderToCopy = "v-next/example-project";

  const sourceFolder = join(goToFolder, repoDir, folderToCopy);
  const destinationFolder = join(goToFolder, projectFolder);
  copyFolder(sourceFolder, destinationFolder);
  const installCommand = `cd ${destinationFolder} && npm install`;
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

export async function runWithPrompts(
  command: string,
  prompts: string | undefined
) {
  const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

  const ptyProcess = spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });

  const queue = prompts
    ? prompts.split("|").map((pair) => {
        const [prompt = "", answer = ""] = pair.split(":");
        return { prompt: prompt.trim(), answer: answer.trim() };
      })
    : [];

  let buffer = "";
  let lastLogged = "";

  ptyProcess.onData((data) => {
    if (data !== lastLogged) {
      console.log("DATA:", data);
      lastLogged = data;
      buffer += data;
    }

    // return if all prompts are answered
    if (queue.length === 0 || queue[0] === undefined) return;

    const { prompt, answer } = queue[0];

    if (buffer.includes(prompt)) {
      console.log(`Answering prompt "${prompt}" with "${answer}"`);
      ptyProcess.write(answer + "\n");
      queue.shift();
      buffer = "";
    }
  });

  ptyProcess.write(command + "\n");
}
