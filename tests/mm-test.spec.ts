// import { testWithMetamask as test } from '../src/utils/wallet-setup/testWithMetamask';
// import { MetaMask } from '@synthetixio/synpress-metamask/types/playwright';
// import setup from '../src/utils/wallet-setup/connected.setup';
// import { setupAndRunTest } from '../src/utils/runTest';
// import { readFileSync } from 'fs';
// import path from 'path';
// const tutorialPaths = process.env.TUTORIAL_PATHS;
// const configPath = process.env.CONFIG_PATH;
// const customTimeout = process.env.CUSTOM_TIMEOUT;

// test(`Testing ${tutorialPaths} with metamask`, async ({ page, context, metamaskPage, extensionId }) => {
//     if (!tutorialPaths) throw new Error("TUTORIAL_PATHS not set");
//     if (!configPath) throw new Error("CONFIG_PATH not set");
//     const tutorials = JSON.parse(tutorialPaths);
//     console.log("tutorials:", tutorials);
  
//     const testConfig = JSON.parse(readFileSync(path.resolve(configPath), "utf8"));
//     console.log("e2eConfig:", testConfig);

//   if (customTimeout) {
//     test.setTimeout(parseInt(customTimeout));
//   }
    
//   const metamask = new MetaMask(context, metamaskPage, setup.walletPassword, extensionId);
//   await setupAndRunTest(page, context, ['/frontend-paymaster'], 'frontend-paymaster', testConfig, metamask);
// });
