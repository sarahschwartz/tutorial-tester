import { test } from "@playwright/test";
import { setupAndRunTest } from "../src/utils/runTest";
import {
  existsSync,
  readFileSync
} from "fs";
import { join } from "path";

const tutorialPaths = process.env.TUTORIAL_PATHS;
const configPath = process.env.CONFIG_PATH;
const customTimeout = process.env.CUSTOM_TIMEOUT;
const folderName = process.env.FOLDER_NAME;
const dirPath = process.env.DIR_PATH;

test(`Testing ${tutorialPaths}`, async ({ page, context }) => {
  if (!tutorialPaths) throw new Error("TUTORIAL_PATHS not set");
  if (!configPath) throw new Error("CONFIG_PATH not set");
  if (!folderName) throw new Error("FOLDER_NAME not set");
  if (!dirPath) throw new Error("DIR_PATH not set");
    if (customTimeout) {
    test.setTimeout(parseInt(customTimeout));
  }

  console.log("tutorials:", tutorialPaths);
  const tutorials = JSON.parse(tutorialPaths);
  console.log("tutorials:", tutorials);

  console.log("configPath:", configPath);

  const filePath = join(dirPath, configPath);
  console.log("filePath:", filePath);
  const fileExists = existsSync(filePath);
  console.log("fileExists:", fileExists);
  if(!fileExists){
    throw new Error(`Config file not found at ${filePath}`);
  }

  const testConfig = JSON.parse(readFileSync(filePath, "utf8"));
  console.log("e2eConfig:", testConfig);

    await setupAndRunTest(
      page,
      context,
      tutorials.paths,
      folderName,
      testConfig,
      dirPath
    );
});

test('Build an ERC20 custom paymaster', async ({ page, context }) => {
  await setupAndRunTest(page, context, ['/erc20-paymaster'], 'erc20-paymaster');
});