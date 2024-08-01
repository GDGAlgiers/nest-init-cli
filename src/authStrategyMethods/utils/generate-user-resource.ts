/* eslint-disable prettier/prettier */
import { exec } from 'child_process';
import { promises as fs } from 'fs';

// Function to generate the user resource and interface
export async function generateUserResource(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    exec('npx nest g resource users', async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating user resource: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error output: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      console.log(`User resource generated: ${stdout}`);

      // Generate user.interface.ts
      const interfaceContent = `
        export interface User {
          id: number;
          email: string;
          password: string;
          // Add other fields as needed
        }
      `;
      const serviceContent = `import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.interface';

@Injectable()
export class UsersService {
  private users: User[] = [];

  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.users.length + 1,
      email: createUserDto.email,
      password: createUserDto.password,
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    return this.users.find((user) => user.id === id);
  }
  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }
  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id);
    if (!user) {
      return null;
    }
    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    this.users.splice(userIndex, 1);
    return true;
  }
}

`;

      const createDtoContent = `// update the class based on your requirements
export class CreateUserDto {
  email: string;
  password: string;
}
`;
      const updateDtoContent = `// update the class based on your requirements
export class UpdateUserDto {
  email?: string;
  password?: string;
}`;

      try {
        await fs.writeFile(
          './src/users/users.module.ts',
          `import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],  
})
export class UsersModule {}`,
        );
        // update service
        await fs.writeFile(
          './src/users/users.service.ts',
          serviceContent.trim(),
        );
        // update create dto
        await fs.writeFile(
          './src/users/dto/create-user.dto.ts',
          createDtoContent.trim(),
        );
        // update update dto
        await fs.writeFile(
          './src/users/dto/update-user.dto.ts',
          updateDtoContent.trim(),
        );
        await fs.writeFile(
          './src/users/user.interface.ts',
          interfaceContent.trim(),
        );
        // update the generated service
        console.log('Created user.interface.ts in src/users');
        resolve();
      } catch (err) {
        console.error('Error generating user interface:', err);
        reject(err);
      }
    });
  });
}
