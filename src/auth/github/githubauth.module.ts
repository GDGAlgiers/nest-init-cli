/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GithubAuthController } from './githubAuth.controller';
import { GithubService } from './github.service';


@Module({
  
  controllers: [GithubAuthController],
  providers: [GithubService, ],
  exports: [GithubService], // Export GithubService to be used in other modules

})
export class GithubAuthModule {}
