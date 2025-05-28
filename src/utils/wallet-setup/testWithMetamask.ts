import { testWithSynpress } from '@synthetixio/synpress/src';
import { metaMaskFixtures } from '@synthetixio/synpress-metamask/src/playwright';
import setup from './connected.setup';

const fixtures = metaMaskFixtures(setup);
export const testWithMetamask = testWithSynpress(fixtures);
