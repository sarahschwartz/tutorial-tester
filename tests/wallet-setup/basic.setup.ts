import { defineWalletSetup } from '@synthetixio/synpress-cache'
import { getExtensionId, MetaMask } from '@synthetixio/synpress/playwright';
import { PASSWORD, SEED_PHRASE } from './config';
import { switchNetwork } from '../../src//utils/metamask';

console.log('Setting up MetaMask wallet...');
console.log('*******************************');
console.log('*******************************');

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, 'MetaMask');
  console.log(`MetaMask extension ID: ${extensionId}`);
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);
  console.log('Importing wallet with seed phrase...');

  await metamask.importWallet(SEED_PHRASE);
  console.log('Wallet imported successfully, switching network...');
  await switchNetwork(metamask);
});
