import { test } from "@playwright/test";
// import { setupAndRunTest } from "../src/utils/runTest";
import {
  existsSync,
  // readFileSync
} from "fs";
import { join } from "path";

const tutorialPaths = process.env.TUTORIAL_PATHS;
const configPath = process.env.CONFIG_PATH;
const customTimeout = process.env.CUSTOM_TIMEOUT;
const dirPath = process.env.DIR_PATH;

test(`Testing ${tutorialPaths}`, async ({ page, context }) => {
  if (!tutorialPaths) throw new Error("TUTORIAL_PATHS not set");
  if (!configPath) throw new Error("CONFIG_PATH not set");
  if (!dirPath) throw new Error("DIR_PATH not set");
  console.log("tutorials:", tutorialPaths);
  const tutorials = JSON.parse(tutorialPaths);
  console.log("tutorials:", tutorials);

  console.log("configPath:", configPath);

  const filePath = join(dirPath, configPath);
  console.log("filePath:", filePath);
  const file = existsSync(filePath);
  console.log("file:", file);

  // const testConfig = JSON.parse(readFileSync(resolve(configPath), "utf8"));
  // console.log("e2eConfig:", testConfig);

  if (customTimeout) {
    test.setTimeout(parseInt(customTimeout));
  }

  //   await setupAndRunTest(
  //     page,
  //     context,
  //     ["/custom-zk-chain", "/custom-zk-chain/customizing-your-chain"],
  //     "custom-zk-chain",
  //     testConfig
  //   );
});
