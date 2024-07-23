/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {
  async githubLoginCallback(user: any, res: any) {
    const { accessToken, profile } = user;
    
    // Handle your logic after successful login
    console.log('User profile:', profile); // Logging user profile to console
    
    // Here you can add services for your application like create user or something else
    // For example:
    // if (!userExists) {
    //   await this.usersService.createUser(profile);
    // }

    // Send a response back to the client
    res.send('Successfully logged in with GitHub.');
  }
}
