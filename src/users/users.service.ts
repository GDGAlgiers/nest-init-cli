/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    // Example user with a hashed password for 'password'
    { userId: 1, username: 'test', password: '$2a$10$wzQJZDH1HEuqzIk4ZwL60O6L78A4nNo5Ki0azNGRq2t2XWvOTy5Eu' },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
  async create(user: { username: string; password: string }) {
    const newUser = {
      userId: this.users.length + 1,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
    }
}