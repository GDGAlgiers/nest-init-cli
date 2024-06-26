import { PassportModule } from '@nestjs/passport';
 import { FacebookStrategy } from './facebook.strategy';
 import { PassportModule } from '@nestjs/passport';
 import { GoogleStrategy } from './google.strategy';
 import { JwtModule } from '@nestjs/jwt';
 import { JwtStrategy } from './jwt.strategy';
 import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
imports:[PassportModule.register({ defaultStrategy: 'facebook' }), PassportModule.register({ defaultStrategy: 'google' }), JwtModule.register({ secret: process.env.JWT_SECRET || "2024", }),    UsersModule, PassportModule],
providers:[FacebookStrategy, GoogleStrategy, JwtStrategy,    AuthService, LocalStrategy],
  exports: [AuthService],

})
export class AuthModule {}
