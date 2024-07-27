import { exec } from 'child_process';

export const asyncExecuteCommand = async (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${stderr}`); // Add this line for debugging
        reject(error);
      } else {
        console.log(`Command execution output: ${stdout}`); // Add this line for debugging
        resolve();
      }
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`Command '${command}' failed with exit code ${code}`); // Add this line for debugging
        reject(new Error(`Command '${command}' failed with code ${code}`));
      }
    });
  });
};
