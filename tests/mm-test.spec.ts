import { testWithMetamask as test } from './wallet-setup/testWithMetamask';
import { MetaMask } from '@synthetixio/synpress/playwright';
import setup from './wallet-setup/basic.setup';
import { setupAndRunTest } from "../src/utils/runTest";
import { existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from 'url';

const tutorialPaths = process.env.TUTORIAL_PATHS;
const configPath = process.env.CONFIG_PATH;
const customTimeout = process.env.CUSTOM_TIMEOUT;
const folderName = process.env.FOLDER_NAME;
const dirPath = process.env.DIR_PATH;
const waitTime = process.env.WAIT_TIME ? parseInt(process.env.WAIT_TIME) : 45000; // Default to 45 seconds
const debugMode = process.env.DEBUG_MODE === 'true';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
test(`Testing ${folderName}`, async ({ page, context, metamaskPage, extensionId }: any) => {
  if (!tutorialPaths) throw new Error("TUTORIAL_PATHS not set");
  if (!configPath) throw new Error("CONFIG_PATH not set");
  if (!folderName) throw new Error("FOLDER_NAME not set");
  if (!dirPath) throw new Error("DIR_PATH not set");
    if (customTimeout) {
    test.setTimeout(parseInt(customTimeout));
  }

  const tutorials = JSON.parse(tutorialPaths);

  const filePath = join(dirPath, configPath);
  const fileExists = existsSync(filePath);
  if(!fileExists){
    throw new Error(`Config file not found at ${filePath}`);
  }

  const url = pathToFileURL(filePath).toString();
  const mod = await import(url);
  const testConfig = mod.default;

  console.log("setting up metamask...")
  const metamask = new MetaMask(context, metamaskPage, setup.walletPassword, extensionId);
  console.log("metamask setup complete, running test...");
    await setupAndRunTest(
      page,
      context,
      tutorials.paths,
      folderName,
      testConfig,
      waitTime,
      debugMode,
      dirPath,
      metamask
    );
});

