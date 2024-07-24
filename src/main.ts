/* eslint-disable prettier/prettier */
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as dotenv from 'dotenv';

// async function bootstrap() {
//   dotenv.config()

//   const app = await NestFactory.create(AppModule);
  
//   await app.listen(3000);
//   console.log(`Application is running on: ${await app.getUrl()}`);
// }

// bootstrap();
