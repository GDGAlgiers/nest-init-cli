/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';

@Injectable()
export class PackageManagerService {
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

  async installDependency(dependency: string, dev = false): Promise<void> {
    if (await this.dependencyExists(dependency)) {
      // console.log(`${dependency} already exists in package.json.`);
      return;
    }

    const packageManager = await this.detectPackageManager();
    if (packageManager === 'unknown') {
      throw new Error('Package manager could not be detected.');
    }

    const command = `${packageManager} ${
      packageManager === 'npm' ? 'install' : 'add'
    } ${dependency} ${
      dev ? (packageManager === 'npm' ? '--save-dev' : '--dev') : ''
    }`;
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
