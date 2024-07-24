/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { exec } from 'child_process';
import { asyncExecuteCommand } from './asyncExecuteCommand';
import * as fs from 'fs';

@Injectable()
export class PackageManagerService {
  private dependencyQueue: { dependency: string; dev: boolean }[] = [];
  private isInstalling = false;

  private async detectPackageManager(): Promise<string> {
    const files = await fs.promises.readdir(process.cwd());
    const hasNpmLockFile = files.includes('package-lock.json');
    if (hasNpmLockFile) {
      return 'npm';
    }
    const hasYarnLockFile = files.includes('yarn.lock');
    if (hasYarnLockFile) {
      return 'yarn';
    }

    const hasPnpmLockFile = files.includes('pnpm-lock.yaml');
    if (hasPnpmLockFile) {
      return 'pnpm';
      return 'pnpm';
    }

    return 'unknown';
  }

  private async dependencyExists(dependency: string): Promise<boolean> {
    const packageJsonPath = `${process.cwd()}/package.json`;
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    const packageJson = JSON.parse(
      await fs.promises.readFile(packageJsonPath, 'utf-8'),
    );
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    return allDependencies.hasOwnProperty(dependency);
  }

  async installDependency(dependency: string, dev = false) {
    this.dependencyQueue.push({ dependency, dev });

    if (!this.isInstalling) {
      this.isInstalling = true;
      await this.processQueue();
    }
  }

  private async processQueue() {
    try {
      if (await this.dependencyExists(dependency)) {
        // console.log(`${dependency} already exists in package.json.`);
        return;
      }

      const packageManager = await this.detectPackageManager();
      if (packageManager === 'unknown') {
        throw new Error('Package manager could not be detected.');
      }

      while (this.dependencyQueue.length > 0) {
        const { dependency, dev } = this.dependencyQueue.shift()!;
        const command = `${packageManager} ${
          packageManager === 'npm' ? 'install' : 'install'
        } ${dependency} ${
          dev ? (packageManager === 'npm' ? '--save-dev' : '--dev') : ''
        }`;
        await asyncExecuteCommand(command);
        // console.log(`${dependency} installed successfully.`);
      }
    } catch (error) {
      console.error(`Failed to install dependencies:`, error);
    } finally {
      this.isInstalling = false;
    }
  }

  async installDependencyVersion(
    dependency: string,
    version: string,
    dev = false,
  ): Promise<void> {
    const packageManager = await this.detectPackageManager();
    const versionArg = version ? `@${version}` : '';
    const command = `${packageManager} add ${dependency}${versionArg} ${
      dev ? '--save-dev' : ''
    }`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing ${dependency}@${version}:`, stderr);
          reject(
            new Error(`Error installing ${dependency}@${version}: ${stderr}`),
          );
        } else {
          console.log(
            `${dependency}@${version} installed successfully:`,
            stdout,
          );
          resolve();
        }
      });
    });
  }
}
