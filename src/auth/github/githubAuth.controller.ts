/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubService } from './github.service';

@Controller('auth')
export class GithubAuthController {
  constructor(
    private readonly githubService: GithubService,
  ) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req, @Res() res) {
    try {
      await this.githubService.githubLoginCallback(req.user, res);
    } catch (err) {
      console.error('Error during GitHub login:', err);
      res.status(500).send('Error during GitHub login.');
    }
  }
}
