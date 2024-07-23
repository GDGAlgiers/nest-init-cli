
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
