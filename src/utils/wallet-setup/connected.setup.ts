import { defineWalletSetup } from '@synthetixio/synpress-cache'
import { getExtensionId } from '@synthetixio/synpress-metamask/src/playwright';
import { MetaMask } from '@synthetixio/synpress-metamask/types/playwright';
import { PASSWORD, SEED_PHRASE } from './config';
import { switchNetwork } from '../metamask';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, 'MetaMask');
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);

  await metamask.importWallet(SEED_PHRASE);
  await switchNetwork(metamask);
});
