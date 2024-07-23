import { AuthController } from './auth.controller';
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
