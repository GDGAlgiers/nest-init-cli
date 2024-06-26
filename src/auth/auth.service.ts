/* eslint-disable prettier/prettier */
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
        
          async validateUser(email: string, pass: string): Promise<any> {
            const user = await this.usersService.findOne(email);
            if (user && await bcrypt.compare(pass, user.password)) {
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
        }
        