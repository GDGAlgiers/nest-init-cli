/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/github/callback',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Log entire profile object for inspection
    console.log('GitHub Profile:', profile);
  
    // Return the entire profile object along with accessToken and refreshToken
    return { accessToken, refreshToken, profile };
  }
  
}
