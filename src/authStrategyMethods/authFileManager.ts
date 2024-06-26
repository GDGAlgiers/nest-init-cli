/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */

import { join } from "path";
import { writeFile } from 'fs/promises';
import { FileManagerService } from "../utils/fileManager.service";


export class AuthFileManager {
  constructor(
    private readonly fileManagerService: FileManagerService
  ) {}
    
     async createFile(name,content,path): Promise<void> {
        const authFolderPath = join(process.cwd(),'src', path); // Folder path corrected to 'auth'
    
        let moduleContent = content;
        let filename = name;
      
      
        try {
          const filePath = join(authFolderPath, filename);
          await writeFile(filePath, moduleContent);
          console.log(` ${filename} created successfully `)
        } catch (err) {
          console.error(`Failed to create ${filename} in auth folder:`, err);
          throw err; // Rethrow the error to handle it further if needed
        }
      
        // const importStatement = `import {  } from '../auth/${filename.replace('.ts', '')}';`; // Adjusted import path
        // await this.fileManagerService.addImportsToAppModule(importStatement, "");
      }
    
     async createServices(): Promise<void> {
        let filename = ``;
        let authServiceContent = `
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer'; // Assuming you are using a mailer module

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService, // Inject the mailer service
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, pass: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({ email, password: hashedPassword });
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new Error('User not found');
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    const resetLink = 'http://yourfrontend.com/reset-password?token=' + token;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: 'You requested a password reset. Click here to reset your password: ' + resetLink,
      html: '<p>You requested a password reset. Click here to reset your password: <a href="' + resetLink + '">' + resetLink + '</a></p>',
    });

    return { message: 'Password reset link sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new Error('Invalid or expired token');
    }

    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.email, hashedPassword);

    return { message: 'Password reset successfully' };
  }
}
`;
                filename = `auth.service.ts`;
                await    this.createFile(filename,authServiceContent,"auth");
              let LocalStrategyContent = `/* eslint-disable prettier/prettier */
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Specify email as the username field
  }

  async validate(email: string, password: string): Promise<any> {
    
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
        }`;
         filename = `local.strategy.ts`;
         await  this.createFile(filename,LocalStrategyContent,"auth");
      
        let authModuleContent = `import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],

})
export class AuthModule {}
`
        filename = `auth.module.ts`;
        await    this.createFile(filename,authModuleContent,"auth");
        let emailmoduleContent = `/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // Use false for TLS
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@example.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class MailModule {}
`
        filename = `email.module.ts`;
        await    this.createFile(filename,emailmoduleContent,"auth");
         }
      
      async addJwtStrategy(): Promise<void> {
        let filename=``
        let jwtStrategyContent = `/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ||"2024",
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
`;
         filename = `jwt.strategy.ts`;
        this.createFile(filename,jwtStrategyContent,"auth");
        let authConrollerContent = `/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}
  
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  @Post('auth/register')
  async register(@Body() body) {
    const { email, password } = body;
    return this.authService.register(email, password);
  }
  @Post('auth/request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('auth/reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }
  @UseGuards(AuthGuard('jwt'))
    @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  
}
`;
         filename = `auth.controller.ts`;
        this.createFile(filename,authConrollerContent,"auth");
        let authModuleContent = `import { AuthController } from './auth.controller';
 import { JwtModule } from '@nestjs/jwt';
 import { JwtStrategy } from './jwt.strategy';
 import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
imports:[JwtModule.register({ secret: process.env.JWT_SECRET||"2024",}),    UsersModule, PassportModule],
providers:[JwtStrategy,    AuthService, LocalStrategy],
  exports: [AuthService],
  controllers:[AuthController]

})
export class AuthModule {}
`
                filename = `auth.module.ts`;
                await    this.createFile(filename,authModuleContent,"auth");

      }
      async addGithubAuthStrategy (): Promise<void> {
        let filename = ``
        let githubStrategyContent = `/* eslint-disable prettier/prettier */
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
`;
                 filename = `github.strategy.ts`;
                this.createFile(filename,githubStrategyContent,"auth/github");
        let githubcontrollerContent = `/* eslint-disable prettier/prettier */
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
`;
                 filename = `githubAuth.controller.ts`;
                this.createFile(filename,githubcontrollerContent,"auth/github");
               let githubServicecontent=`/* eslint-disable prettier/prettier */
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
`
               filename =`github.service.ts`
               this.createFile(filename,githubServicecontent,"auth/github");
               let githubModulecontent=`/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GithubAuthController } from './githubAuth.controller';
import { GithubService } from './github.service';


@Module({
  
  controllers: [GithubAuthController],
  providers: [GithubService, ],
  exports: [GithubService], // Export GithubService to be used in other modules

})
export class GithubAuthModule {}
`
               filename =`githubauth.module.ts`
               this.createFile(filename,githubModulecontent,"auth/github");

      }

}