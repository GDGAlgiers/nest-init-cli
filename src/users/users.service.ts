/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    // Example user with a hashed password for 'password'
    { userId: 1, email: 'ghmamnbyl@gmail.com', password: '$2a$10$wzQJZDH1HEuqzIk4ZwL60O6L78A4nNo5Ki0azNGRq2t2XWvOTy5Eu' },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
  async create(user: { email: string; password: string }) {
    const newUser = {
      userId: this.users.length + 1,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
    }
    async updatePassword(email: string, newPassword: string): Promise<User | undefined> {
      const userIndex = this.users.findIndex((user) => user.email === email);
    
      if (userIndex === -1) {
        return undefined; // User not found
      }
    
      // Create a new object to avoid mutating the original user object directly
      const updatedUser = { ...this.users[userIndex], password: newPassword };
    
      // Update the user object in the array
      this.users[userIndex] = updatedUser
    
      // Return the updated user object
      return updatedUser;
    }
    
    
}