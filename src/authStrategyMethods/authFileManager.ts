/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */

import { join } from "path";
import { writeFile } from 'fs/promises';
import { FileManager } from "./utils/fileManager";
import { FileManagerService } from "../utils/fileManager.service";


export class AuthFileManager {
  constructor(
    private readonly fileManagerService: FileManagerService
  ) {}
 
    
     async createFile(name,content): Promise<void> {
        const authFolderPath = join(process.cwd(),'src', 'auth'); // Folder path corrected to 'auth'
    
        let moduleContent = content;
        let filename = name;
      
      
        try {
          console.log('Auth Folder Path:', authFolderPath);
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
     async modifyAppController(): Promise<void> {
        const authFolderPath = join(process.cwd(),'src'); // Folder path corrected to 'auth'
    
        let moduleContent = `/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly authService: AuthService
  ) {}
  
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  @Post('auth/register')
  async register(@Body() body) {
    const { username, password } = body;
    return this.authService.register(username, password);
  }
  @UseGuards(AuthGuard('jwt'))
    @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
`;
        let filename = `app.controller.ts`;
      
      
        try {
          const filePath = join(authFolderPath, filename);
          await writeFile(filePath, moduleContent);
          console.log(` ${filename} modified successfully `)
        } catch (err) {
          console.error(`Failed to modify ${filename}`, err);
          throw err; // Rethrow the error to handle it further if needed
        }
      
        // const importStatement = `import {  } from '../auth/${filename.replace('.ts', '')}';`; // Adjusted import path
        // await this.fileManagerService.addImportsToAppModule(importStatement, "");
      }
     async createServices(): Promise<void> {
        let filename = ``;
        let authServiceContent = `/* eslint-disable prettier/prettier */
        import { Injectable } from '@nestjs/common';
        import { UsersService } from '../users/users.service';
        import { JwtService } from '@nestjs/jwt';
        import * as bcrypt from 'bcryptjs';
        
        @Injectable()
        export class AuthService {
          constructor(
            private usersService: UsersService,
            private jwtService: JwtService,
          ) {}
        
          async validateUser(username: string, pass: string): Promise<any> {
            const user = await this.usersService.findOne(username);
            if (user && await bcrypt.compare(pass, user.password)) {
              const { password, ...result } = user;
              return result;
            }
            return null;
          }
        
          async login(user: any) {
            const payload = { username: user.username, sub: user.id };
            return {
              access_token: this.jwtService.sign(payload),
            };
          }
        
          async register(username: string, pass: string) {
            const hashedPassword = await bcrypt.hash(pass, 10);
            const user = await this.usersService.create({ username, password: hashedPassword });
            const payload = { username: user.username, sub: user.userId };
            return {
              access_token: this.jwtService.sign(payload),
            };
          }
        }
        `
                filename = `auth.service.ts`;
                await    this.createFile(filename,authServiceContent);
              let LocalStrategyContent = `/* eslint-disable prettier/prettier */
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
        }`;
         filename = `local.strategy.ts`;
         await  this.createFile(filename,LocalStrategyContent);
      
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
        await    this.createFile(filename,authModuleContent);
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
    return { userId: payload.sub, username: payload.username };
  }
}
`;
        let filename = `jwt.strategy.ts`;
        this.createFile(filename,jwtStrategyContent);

       await this.modifyAppController();
      }
}