/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
// import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PackageManagerService {
  private async detectPackageManager(): Promise<string> {
    const files = await fs.promises.readdir(process.cwd());
    const hasNpmLockFile = files.includes('package-lock.json');
    if (hasNpmLockFile) {
      return 'npm'
    }
    const hasYarnLockFile = files.includes('yarn.lock');
    if (hasYarnLockFile) {
      return 'yarn'
    }

    const hasPnpmLockFile = files.includes('pnpm-lock.yaml');
    if (hasPnpmLockFile) {
      return 'pnpm'
    }
    
    return 'unknown';
  }
  async installDependency(dependency: string, dev = false): Promise<void> {
    const packageManager = await this.detectPackageManager();
    const command = `${packageManager} add ${dependency} ${dev ? '--save-dev' : ''}`;
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing ${dependency}:`, stderr);
          reject(new Error(`Error installing ${dependency}: ${stderr}`));
        } else {
          console.log(`${dependency} installed successfully:`, stdout);
          resolve();
        }
      });
    });
  }
  
}
