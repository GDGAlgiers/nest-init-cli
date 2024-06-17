/* eslint-disable prettier/prettier */
import { prompt } from 'inquirer';
import { appendFileSync, readFileSync, existsSync } from 'fs';

const requiredMysqlEnvVariables = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DB'];
const requiredPostgresEnvVariables = ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];

export async function checkAndPromptEnvVariables(dbType: 'mysql' | 'postgres') {
  const requiredEnvVariables = dbType === 'mysql' ? requiredMysqlEnvVariables : requiredPostgresEnvVariables;
  const missingEnvVariables = requiredEnvVariables.filter(envVar => !process.env[envVar]);

  if (missingEnvVariables.length > 0) {
    console.log(`The following environment variables are missing: ${missingEnvVariables.join(', ')}`);

    const answers = await prompt(
      missingEnvVariables.map(envVar => ({
        type: 'input',
        name: envVar,
        message: `Please enter the value for ${envVar}:`,
      }))
    );

    appendToEnvFile(answers);
  }
}

function appendToEnvFile(envVars: { [key: string]: string }) {
  const envFilePath = '.env';
  let envFileContent = '';

  if (existsSync(envFilePath)) {
    envFileContent = readFileSync(envFilePath, 'utf8');
  } else {
    console.log('.env file does not exist. Creating a new one.');
  }

  const updatedEnvFileContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .reduce((content, line) => {
      const regex = new RegExp(`^${line.split('=')[0]}=`, 'm');
      return regex.test(content) ? content.replace(regex, line) : content + `\n${line}`;
    }, envFileContent);

  appendFileSync(envFilePath, updatedEnvFileContent);
}
