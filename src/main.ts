import { NestFactory } from '@nestjs/core';
import { ConfigureCommand } from './commands/configure.command';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting application context...');
    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error'],
    });

    const configureCommand = appContext.get(ConfigureCommand);

    console.log('Running configure command...');
    await configureCommand.run();

    console.log('Configuration complete.');
  } catch (error) {
    console.error('An error occurred during configuration:', error);
  } finally {
    return;
    process.exit(0);
  }
}

bootstrap();
