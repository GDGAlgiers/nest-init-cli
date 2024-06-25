/* eslint-disable prettier/prettier */
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { promises as fs } from 'fs';
import { join } from 'path';
export class FileManagerService {
  
private async readByLineAsyncAndUpdate(filePath:string,providerName:string,stringCheck:string,providerPath:string):Promise<string> {
  let fileData = `${providerPath}\n `;
  const lineReader = await import('line-reader')
  return new Promise((resolve, reject) => {
    let providersFound = false;

    lineReader.eachLine(filePath, function(line, last) {
      if (line.toString().includes(`${stringCheck}:`)) {
        providersFound = true;
      }
      if (providersFound) {
          const provider = line.replace('[','')
          fileData += `${stringCheck}:[${providerName}, ${provider.replace(`${stringCheck}:`,'')}\n`;
        providersFound = false;
      }else{

        fileData += `${line.toString()}\n`;
      }
      if (last) {
        resolve(fileData);
      }
    });
  });
}

  async addProviderToAppModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/app.module.ts';


    const fileData:string = await this.readByLineAsyncAndUpdate(filePath,providerName,"providers",providerPath)
    await writeFile(filePath, fileData);
  }

  async addImportsToAppModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/app.module.ts';


    const fileData:string = await this.readByLineAsyncAndUpdate(filePath,providerName,"imports",providerPath)
    await writeFile(filePath, fileData);
  }
  async createDirectoryIfNotExists(path: string): Promise<void> {
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
  }
  async doesFolderExist(folder): Promise<boolean> {
    const folderPath = join(__dirname, '..', folder);

  
    // Check if the folder exists
    if (existsSync(folderPath)) {
      return true;
    } else {
      return false;
    }
  }
}
