import { exec } from 'child_process';

export const asyncExecuteCommand = async (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command '${command}' failed with code ${code}`));
      }
    });
  });
};
