#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { ConfigureCommand } from './commands/configure.command';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error'],
    });

    const configureCommand = appContext.get(ConfigureCommand);
    await configureCommand.run();
    console.log('Configuration complete.');
    while (true) {
      await configureCommand.run();
    }
  } catch (error) {
    console.error('An error occurred during configuration:', error);
  }
}

bootstrap();
