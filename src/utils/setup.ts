import { execSync } from 'child_process';
import fs from 'fs';
import type { Page } from '@playwright/test';

export async function startLocalServer(page: Page, timeout: number) {
  console.log('STARTING...');
  await page.waitForTimeout(timeout);
  console.log(`WAITED ${timeout / 1000} SECONDS FOR LOCAL SERVER TO START`);
}

export function stopServers() {
  const isRunning = checkIfServersRunning();
  if (isRunning) {
    console.log('STOPPING SERVERS');
    // stop & delete pm2 servers
    const STOP_SERVERS = 'bun pm2 delete all';
    execSync(STOP_SERVERS, {
      encoding: 'utf-8',
    });
    console.log('DONE STOPPING SERVERS');
  }
}

export function checkIfServersRunning() {
  try {
    const output = execSync('bun pm2 list --no-color').toString();
    return output.includes('online');
  } catch (error) {
    console.error('Error checking PM2 servers:', error);
    return false;
  }
}

export async function setupFolders(projectFolder: string) {
  console.log('SETTING UP FOLDERS');
  const outputPath = 'tests-output';
  fs.mkdirSync(outputPath, { recursive: true });
  const projectPath = `outputPath/${projectFolder}`;
  if (fs.existsSync(projectPath)) {
    await fs.promises.rm(projectPath, {
      recursive: true,
      force: true,
    });
  }
}
