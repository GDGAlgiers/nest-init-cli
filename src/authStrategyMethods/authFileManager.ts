/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */

import { join } from 'path';
import { writeFile } from 'fs/promises';
import { FileManagerService } from '../utils/fileManager.service';
import { promises as fs } from 'fs';
export class AuthFileManager {
  constructor(private readonly fileManagerService: FileManagerService) {}

  async createFile(name: string, content: string, path: string): Promise<void> {
    const authFolderPath = join(process.cwd(), 'src', path);

    let moduleContent = content;
    let filename = name;

    try {
      const filePath = join(authFolderPath, filename);
      await writeFile(filePath, moduleContent);
      console.log(`${filename} created successfully `);
    } catch (err) {
      console.error(`Failed to create ${filename} in auth folder:`, err);
      throw err; // Rethrow the error to handle it further if needed
    }
  }

  async createServices(): Promise<void> {
    let filename = ``;
    let authServiceContent = `
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUserById(
    id: number,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.findOne(id);
    if (
      user &&
      typeof user !== 'string' &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByEmail(
    email: string,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      typeof user !== 'string' &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return result;
  }

  async requestPasswordReset(email: string) {
    const user = this.usersService.findAll().find((u) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetLink = 'http://yourfrontend.com/reset-password?email=' + email;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text:
        'You requested a password reset. Click here to reset your password: ' +
        resetLink,
      html:
        '<p>You requested a password reset. Click here to reset your password: <a href="' +
        resetLink +
        '">' +
        resetLink +
        '</a></p>',
    });

    return { message: 'Password reset link sent' };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = this.usersService.findAll().find((u) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  async findUserById(userId: number) {
    return this.usersService.findOne(userId);
  }
}
`;
    filename = `auth.service.ts`;
    await this.createFile(filename, authServiceContent, 'auth');

    const authControllerContent = `/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // Return the user data from the request
    return req.user;
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, newPassword);
  }

  @UseGuards(AuthGuard('local'))
  @Get('profile')
  getProfile(@Request() req) {
    // Return the authenticated user profile
    return req.user;
  }
}`;
    filename = `auth.controller.ts`;
    await this.createFile(filename, authControllerContent, 'auth');

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
    const user = await this.authService.validateUserByEmail(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
`;
    filename = `local.strategy.ts`;
    await this.createFile(filename, LocalStrategyContent, 'auth');

    let mailerModuleContent = `import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
    `;
    filename = `mailer.module.ts`;
    await this.createFile(filename, mailerModuleContent, 'mailer');

    let authModuleContent = `import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '../mailer/mailer.module';
import { LocalStrategy } from './local.strategy';


@Module({
  imports: [UsersModule, PassportModule, MailerModule],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],

})
export class AuthModule {}
`;
    filename = `auth.module.ts`;
    await this.createFile(filename, authModuleContent, 'auth');
  }

  async createCookiesService(): Promise<void> {
    let filename = ``;
    let authServiceContent = `
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUserById(
    id: number,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.findOne(id);
    if (
      user &&
      typeof user !== 'string' &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByEmail(
    email: string,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      typeof user !== 'string' &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return result;
  }

  async requestPasswordReset(email: string) {
    const user = this.usersService.findAll().find((u) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetLink = 'http://yourfrontend.com/reset-password?email=' + email;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text:
        'You requested a password reset. Click here to reset your password: ' +
        resetLink,
      html:
        '<p>You requested a password reset. Click here to reset your password: <a href="' +
        resetLink +
        '">' +
        resetLink +
        '</a></p>',
    });

    return { message: 'Password reset link sent' };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = this.usersService.findAll().find((u) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  async findUserById(userId: number) {
    return this.usersService.findOne(userId);
  }
}
`;
    filename = `auth.service.ts`;
    await this.createFile(filename, authServiceContent, 'auth');
  }

  async createAuthModule(): Promise<void> {
    let mailerModuleContent = `import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
    `;
    let filename = `mailer.module.ts`;
    await this.createFile(filename, mailerModuleContent, 'mailer');
    let authModuleContent = `import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService],
  exports: [AuthService],

})
export class AuthModule {}
`;
    filename = `auth.module.ts`;
    await this.createFile(filename, authModuleContent, 'auth');

    let authServiceContent = `/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return result;
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetLink = 'http://yourfrontend.com/reset-password?email=' + email;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
       text:
        'You requested a password reset. Click here to reset your password: ' +
        resetLink,
      html:
        '<p>You requested a password reset. Click here to reset your password: <a href="' +
        resetLink +
        '">' +
        resetLink +
        '</a></p>',
    });

    return { message: 'Password reset link sent' };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }
}`;
    filename = `auth.service.ts`;
    await this.createFile(filename, authServiceContent, 'auth');

    const authControllerContent = `/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, newPassword);
  }
}
`;
    filename = `auth.controller.ts`;
    await this.createFile(filename, authControllerContent, 'auth');
  }
  async createGoogleAuthStrategy(): Promise<void> {
    let filename = 'google.strategy.ts';
    let googleStrategyContent = `/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    const payload = {
      user,
      accessToken,
    };

    done(null, payload);
  }
}
`;
    await this.createFile(filename, googleStrategyContent, 'auth/google');

    let googleControllerContent = `/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleService } from './google.service';

@Controller('auth')
export class GoogleAuthController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    try {
      await this.googleService.googleLoginCallback(req.user, res);
    } catch (err) {
      console.error('Error during Google login:', err);
      res.status(500).send('Error during Google login.');
    }
  }
}
`;
    filename = 'googleAuth.controller.ts';
    await this.createFile(filename, googleControllerContent, 'auth/google');

    let googleServiceContent = `/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleService {
  async googleLoginCallback(user: any, res: any) {
    const { accessToken, profile } = user;

    // Handle your logic after successful login
    console.log('User profile:', profile); // Logging user profile to console

    // Here you can add services for your application like create user or something else
    // For example:
    // if (!userExists) {
    //   await this.usersService.createUser(profile);
    // }

    // Send a response back to the client
    res.send('Successfully logged in with Google.');
  }
}
`;
    filename = 'google.service.ts';
    await this.createFile(filename, googleServiceContent, 'auth/google');

    let googleModuleContent = `/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GoogleAuthController } from './googleAuth.controller';
import { GoogleService } from './google.service';

@Module({
  controllers: [GoogleAuthController],
  providers: [GoogleService],
  exports: [GoogleService], // Export GoogleService to be used in other modules
})
export class GoogleAuthModule {}
`;
    filename = 'googleauth.module.ts';
    await this.createFile(filename, googleModuleContent, 'auth/google');
  }
  async createFacebookAuthStrategy(): Promise<void> {
    let filename = 'facebook.strategy.ts';
    let facebookStrategyContent = `/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['emails', 'name', 'photos']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    const payload = {
      user,
      accessToken,
    };

    done(null, payload);
  }
}
`;
    await this.createFile(filename, facebookStrategyContent, 'auth/facebook');

    let facebookControllerContent = `/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FacebookService } from './facebook.service';

@Controller('auth')
export class FacebookAuthController {
  constructor(private readonly facebookService: FacebookService) {}

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req, @Res() res) {
    try {
      await this.facebookService.facebookLoginCallback(req.user, res);
    } catch (err) {
      console.error('Error during Facebook login:', err);
      res.status(500).send('Error during Facebook login.');
    }
  }
}
`;
    filename = 'facebookAuth.controller.ts';
    await this.createFile(filename, facebookControllerContent, 'auth/facebook');

    let facebookServiceContent = `/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookService {
  async facebookLoginCallback(user: any, res: any) {
    const { accessToken, profile } = user;

    // Handle your logic after successful login
    console.log('User profile:', profile); // Logging user profile to console

    // Here you can add services for your application like create user or something else
    // For example:
    // if (!userExists) {
    //   await this.usersService.createUser(profile);
    // }

    // Send a response back to the client
    res.send('Successfully logged in with Facebook.');
  }
}
`;
    filename = 'facebook.service.ts';
    await this.createFile(filename, facebookServiceContent, 'auth/facebook');

    let facebookModuleContent = `/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FacebookAuthController } from './facebookAuth.controller';
import { FacebookService } from './facebook.service';

@Module({
  controllers: [FacebookAuthController],
  providers: [FacebookService],
  exports: [FacebookService], // Export FacebookService to be used in other modules
})
export class FacebookAuthModule {}
`;
    filename = 'facebookauth.module.ts';
    await this.createFile(filename, facebookModuleContent, 'auth/facebook');
  }

  async addJwtStrategy(): Promise<void> {
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
    let filename = `jwt.strategy.ts`;
    filename = `jwt.strategy.ts`;
    this.createFile(filename, jwtStrategyContent, 'auth');
    let authControllerContent = `/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  @Post('auth/register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('auth/request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('auth/reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
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
    this.createFile(filename, authControllerContent, 'auth');
    let authModuleContent = `import { AuthController } from './auth.controller';
 import { JwtModule } from '@nestjs/jwt';
 import { JwtStrategy } from './jwt.strategy';
 import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';


@Module({
imports:[JwtModule.register({ secret: process.env.JWT_SECRET||"2024",}),    UsersModule, PassportModule],
providers:[JwtStrategy,    AuthService],
  exports: [AuthService],
  controllers:[AuthController]

})
export class AuthModule {}
`;
    filename = `auth.module.ts`;
    await this.createFile(filename, authModuleContent, 'auth');
    let authServiceContent = `
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUserById(
    id: number,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.findOne(id);
    if (
      user &&
      typeof user !== 'string' &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByEmail(
    email: string,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      typeof user !== 'string' &&
      (await bcrypt.compare(pass, user.password))
    ) {
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

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async requestPasswordReset(email: string) {
    const user = this.usersService.findAll().find((u) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    const resetLink = 'http://yourfrontend.com/reset-password?token=' + token;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text:
        'You requested a password reset. Click here to reset your password: ' +
        resetLink,
      html:
        '<p>You requested a password reset. Click here to reset your password: <a href="' +
        resetLink +
        '">' +
        resetLink +
        '</a></p>',
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

    const user = this.usersService
      .findAll()
      .find((u) => u.email === payload.email);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }
  async findUserById(userId: number) {
    return this.usersService.findOne(userId);
  }
}
`;
    filename = `auth.service.ts`;
    await this.createFile(filename, authServiceContent, 'auth');
  }

  async addSessionStrategy(): Promise<void> {
    let sessionStrategyContent = `
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service'; // Import your authentication service

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, user.id); // Serialize user by storing only user id in session
  }

  async deserializeUser(userId: number, done: Function) {
    try {
      const user = await this.authService.findUserById(userId); // Fetch user from database using userId
      done(null, user); // Deserialize user from stored userId in session
    } catch (error) {
      done(error, null);
    }
  }
}
`;
    let filename = `session.strategy.ts`;
    filename = `session.strategy.ts`;
    this.createFile(filename, sessionStrategyContent, 'auth');
    let ProtectedModuleContent = `import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ProtectedController } from './protected.controller';
import { ProtectedService } from './protected.service';

@Module({
  imports: [PassportModule],
  controllers: [ProtectedController],
  providers: [ProtectedService],
  exports: [ProtectedService],
})
export class ProtectedModule {}`;
    filename = `protected.module.ts`;
    this.createFile(filename, ProtectedModuleContent, 'protected');
    let ProtectedControllerContent = `import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProtectedService } from './protected.service';

@Controller('protected')
export class ProtectedController {
  constructor(private readonly protectedService: ProtectedService) {}

  @Get()
  @UseGuards(AuthGuard('session')) // Protect this route with session-based authentication
  getProtectedResource(@Request() req) {
    // Example: Extract userId from session data
    const userId = req.user.id;
    return this.protectedService.getProtectedResource(userId);
  }
}`;
    filename = `protected.controller.ts`;
    this.createFile(filename, ProtectedControllerContent, 'protected');
    let ProtectedServiceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtectedService {
  getProtectedResource(userId: number): string {
    // Example logic to retrieve protected data based on userId
    return "Protected data for user";
  }
}`;
    filename = `protected.service.ts`;
    this.createFile(filename, ProtectedServiceContent, 'protected');

    const mainTsContent = `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "2024",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 3600000 }, // Set secure to true if using HTTPS
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
  `;

    const filePath = join(process.cwd(), 'src', 'main.ts');

    try {
      await fs.writeFile(filePath, mainTsContent, 'utf8');
      console.log('File main.ts created successfully');
    } catch (err) {
      console.error('Error creating file main.ts:', err);
    }
  }

  async addCookiesStrategy(): Promise<void> {
    let sessionStrategyContent = `
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service'; // Import your authentication service

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, user.id); // Serialize user by storing only user id in session
  }

  async deserializeUser(userId: number, done: Function) {
    try {
      const user = await this.authService.findUserById(userId); // Fetch user from database using userId
      done(null, user); // Deserialize user from stored userId in session
    } catch (error) {
      done(error, null);
    }
  }
}
`;
    let filename = `cookies.strategy.ts`;
    filename = `cookies.strategy.ts`;
    this.createFile(filename, sessionStrategyContent, 'auth');
    let ProtectedModuleContent = `import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ProtectedController } from './protected.controller';
import { ProtectedService } from './protected.service';

@Module({
  imports: [PassportModule],
  controllers: [ProtectedController],
  providers: [ProtectedService],
  exports: [ProtectedService],
})
export class ProtectedModule {}`;
    filename = `protected.module.ts`;
    this.createFile(filename, ProtectedModuleContent, 'protected');
    let ProtectedControllerContent = `import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProtectedService } from './protected.service';

@Controller('protected')
export class ProtectedController {
  constructor(private readonly protectedService: ProtectedService) {}

  @Get()
  @UseGuards(AuthGuard('session')) // Protect this route with session-based authentication
  getProtectedResource(@Request() req) {
    // Example: Extract userId from session data
    const userId = req.user.id;
    return this.protectedService.getProtectedResource(userId);
  }
}`;
    filename = `protected.controller.ts`;
    this.createFile(filename, ProtectedControllerContent, 'protected');
    let ProtectedServiceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtectedService {
  getProtectedResource(userId: number): string {
    // Example logic to retrieve protected data based on userId
    return "Protected data for user";
  }
}`;
    filename = `protected.service.ts`;
    this.createFile(filename, ProtectedServiceContent, 'protected');

    const mainTsContent = `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "2024",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 3600000 }, // Set secure to true if using HTTPS
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
  `;

    const filePath = join(process.cwd(), 'src', 'main.ts');

    try {
      await fs.writeFile(filePath, mainTsContent, 'utf8');
      console.log('File main.ts created successfully');
    } catch (err) {
      console.error('Error creating file main.ts:', err);
    }
  }

  async addGithubAuthStrategy(): Promise<void> {
    let filename = ``;
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
    this.createFile(filename, githubStrategyContent, 'auth/github');
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
    this.createFile(filename, githubcontrollerContent, 'auth/github');
    let githubServicecontent = `/* eslint-disable prettier/prettier */
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
`;
    filename = `github.service.ts`;
    this.createFile(filename, githubServicecontent, 'auth/github');
    let githubModulecontent = `/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GithubAuthController } from './githubAuth.controller';
import { GithubService } from './github.service';


@Module({
  
  controllers: [GithubAuthController],
  providers: [GithubService, ],
  exports: [GithubService], // Export GithubService to be used in other modules

})
export class GithubAuthModule {}
`;
    filename = `githubauth.module.ts`;
    this.createFile(filename, githubModulecontent, 'auth/github');
  }
}
