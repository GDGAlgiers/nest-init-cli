/* eslint-disable prettier/prettier */
import { writeFile } from 'fs/promises';
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
}