import { exec } from 'child_process';

export const asyncExecuteCommand = async (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${stderr}`);
        reject(error);
      } else {
        console.log(`Command execution output: ${stdout}`);
        resolve();
      }
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`Command '${command}' failed with exit code ${code}`);
        reject(new Error(`Command '${command}' failed with code ${code}`));
      }
    });
  });
};
