/* eslint-disable prettier/prettier */
import { prompt } from 'inquirer';
import { appendFileSync, readFileSync, existsSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables from the .env file
config();

const requiredMysqlEnvVariables = [
  'MYSQL_HOST',
  'MYSQL_PORT',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DB',
];
const requiredPostgresEnvVariables = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
];
const requiredMongoEnvVariables = ['MONGODB_URI', 'MONGODB_DB'];
const requiredGoogleOAuthVariables = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const requiredGithubVariables = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];

const requiredFacebookVariables = ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'];
export async function checkAndPromptEnvVariables(
  service: 'github' | 'mysql' | 'postgres' | 'mongodb' | 'google' | 'facebook',
) {
  const requiredEnvVariables =
    service === 'mysql'
      ? requiredMysqlEnvVariables
      : service === 'postgres'
      ? requiredPostgresEnvVariables
      : service === 'google'
      ? requiredGoogleOAuthVariables
      : service === 'facebook'
      ? requiredFacebookVariables
      : service === 'github'
      ? requiredGithubVariables
      : requiredMongoEnvVariables;

  const missingEnvVariables = requiredEnvVariables.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingEnvVariables.length > 0) {
    console.log(
      `The following environment variables are missing: ${missingEnvVariables.join(
        ', ',
      )}`,
    );

    const answers = await prompt(
      missingEnvVariables.map((envVar) => ({
        type: 'input',
        name: envVar,
        message: `Please enter the value for ${envVar}:`,
      })),
    );

    appendToEnvFile(answers);
  } else {
    console.log('All required environment variables are already set.');
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
  const linesToAdd = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .filter(([key]) => !envFileContent.includes(`${key}=`))
    .join('\n');

  if (linesToAdd.length > 0) {
    const updatedEnvFileContent =
      envFileContent === '' ? linesToAdd : `\n${linesToAdd}`;
    appendFileSync(envFilePath, updatedEnvFileContent);
    console.log('Updated .env file with new environment variables.');
  } else {
    console.log('No new environment variables to add to .env file.');
  }
}
