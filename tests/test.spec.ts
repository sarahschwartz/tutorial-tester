import { test } from "@playwright/test";
// import { setupAndRunTest } from "../src/utils/runTest";
import { existsSync, 
    // readFileSync 
} from "fs";
// import path from "path";

const tutorialPaths = process.env.TUTORIAL_PATHS;
const configPath = process.env.CONFIG_PATH;
const customTimeout = process.env.CUSTOM_TIMEOUT;

test(`Testing ${tutorialPaths}`, async ({ page, context }) => {
  if (!tutorialPaths) throw new Error("TUTORIAL_PATHS not set");
  if (!configPath) throw new Error("CONFIG_PATH not set");
//   const tutorials = JSON.parse(tutorialPaths);
  console.log("tutorials:", tutorialPaths);
//   console.log("tutorials:", tutorials);

console.log("configPath:", configPath);
  const file = existsSync(configPath);
  console.log("file:", file);

  //   const testConfig = JSON.parse(readFileSync(path.resolve(configPath), "utf8"));
  //   console.log("e2eConfig:", testConfig);

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
