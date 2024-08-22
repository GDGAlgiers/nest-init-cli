[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->

<br />
<p align="center">
   <a href="https://github.com/GDGAlgiers/nest-init"><img src="/static/GDGAlgiers.png" height="auto" width="auto" style="border-radius:50%"></a>
  <h3 align="center">Nest-Init CLI</h3>
  <p align="center">
The Repository for Nest-Init CLI made using 
    <a href="https://nestjs.com/">NestJS</a>, <a href="https://www.npmjs.com/package/nest-commander">NestJS Commander</a>, <a href="https://github.com/SBoudrias/Inquirer.js">Inquirer</a> and <a href="https://www.passportjs.org/">Passport.js</a>.
    <br />
    <br />
    <a href="https://github.com/GDGAlgiers/nest-init/issues">Report Bug</a>
    ·
    <a href="https://github.com/GDGAlgiers/nest-init/issues">Request Feature</a>
  </p>
<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>

- [About The Project](#about-the-project)
  - [Features](#features)
  - [Built With](#built-with)
- [Getting Started](#getting-started)

  - [System Requirements](#system-requirements)
  - [Using Nest-Init in Your Project](#using-nest-init-in-your-project)
  - [Contributing to Nest-Init](#contributing-to-nest-init)

- [Usage](#usage)

- [List of Commands](#list-of-commands)

  - [Configure ORM with Database](#config-orm-db)

    - [MikroORM](#mikroorm)
    - [TypeORM](#typeorm)
    - [Mongoose](#mongoose)
    - [Sequelize](#sequelize)
    - [Prisma](#prisma)
    - [Drizzle](#drizzle)

  - [Setup Authentication Strategies and Services](#setup-authentication-strategies-and-services)

- [Join our community](#join-our-community)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

</details>

# About The Project

Nest-Init is a powerful CLI tool designed to streamline the creation and configuration of new NestJS projects. It simplifies the setup process, allowing you to integrate different databases with ORMs and set up authentication efficiently. Nest-Init equips you with essential tools to launch your next NestJS application with ease.

### Features

1. **Database Configuration**
   - **ORM Integration**: Choose between MikroORM, TypeORM, Sequelize, Prisma, and Drizzle with automatic configuration and connection setup.
   - **ODM Integration**: Setup Mongoose for MongoDB with pre-configured models and schemas.
2. **Authentication Setup**
   - Implement JWT authentication with pre-configured guards and strategies.
   - Add social authentication for services like Google, Facebook and Github.

### Built with

- **<a href="https://nestjs.com/">NestJS</a>**
- **<a href="https://www.npmjs.com/package/nest-commander">Nest Commander</a>**
- **<a href="https://github.com/SBoudrias/Inquirer.js">Inquirer</a>**
- **<a href="https://www.passportjs.org/">Passport.js</a>**

# Getting Started

### System Requirements

To get started with Nest-Init, ensure you have <a href="https://nodejs.org/en/download/package-manager">Node.js and npm</a> installed on your machine.

### Using Nest-Init in Your Project

- In order to use Nest-Init within your NestJS project, install the package globally using the command:

  ```bash
  npm install -g nest-init-cli
  ```

- Once it is installed, follow the prompts to start configuring your project.

### Contributing to Nest-Init

If you're interested in maintaining or developing the package, follow these steps:

1. **Clone the repository:**
   ```bash
    git clone https://github.com/GDGAlgiers/nest-init.git
    cd nest-init
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the project locally:**
   ```bash
   npm run start
   ```
4. **Make your changes and create a pull request:**

   - Make sure to follow the contribution guidelines in [CONTRIBUTION.md](CONTRIBUTION.md)

# Usage

Once you have configured your project with Nest-Init, you can begin using the CLI within your NestJS project.

**Initializing the CLI**

In your project directory, execute the command:

```bash
nest-init
```

After initializing the CLI, you will see the following menu options:

```bash
1. Configure ORM with Database
2. Setup Authentication Strategies and Services
```

Choose the option that suits your project needs and follow the prompts to configure your NestJS application accordingly.

# List of Commands

## Configure ORM with Database

Use the following command to install and configure your chosen ORM with a specific database:

```bash
nest-init install-<ORM> -<database>
```

Below, you'll find detailed commands for each combination of ORM and supported databases.

### MikroORM

Configure MikroORM with MySQL, PostgreSQL, or MongoDB.

- MySQL

  ```bash
  nest-init install-mikroorm -my
  ```

  or

  ```bash
  nest-init install-mikroorm --mysql
  ```

- PostgreSQL

  ```bash
  nest-init install-mikroorm -psql
  ```

  or

  ```bash
  nest-init install-mikroorm --postgresql
  ```

- MongoDB
  `bash
nest-init install-mikroorm -m
`
  or
  `bash
nest-init install-mikroorm --mongodb
`

### TypeORM

Configure TypeORM with MySQL, PostgreSQL, or MongoDB.

- MySQL

  ```bash
  nest-init install-typeorm -my
  ```

  or

  ```bash
  nest-init install-typeorm --mysql
  ```

- PostgreSQL

  ```bash
  nest-init install-typeorm -psql
  ```

  or

  ```bash
  nest-init install-typeorm --postgresql
  ```

- MongoDB
  `bash
nest-init install-typeorm -m
`
  or
  `bash
nest-init install-typeorm --mongodb
`

### Mongoose

Configure Mongoose with MongoDB.

```bash
nest-init install-mongoose -m
```

or

```bash
nest-init install-mongoose --mongodb
```

### Sequelize

Configure Sequelize with MySQL, PostgreSQL, or MongoDB.

- MySQL

  ```bash
  nest-init install-sequelize -my
  ```

  or

  ```bash
  nest-init install-sequelize --mysql
  ```

- PostgreSQL
  `bash
nest-init install-sequelize -psql
`
  or
  `bash
nest-init install-sequelize --postgresql
`

### Prisma

Configure Prisma with PostgreSQL or MongoDB.

- PostgreSQL

  ```bash
  nest-init install-prisma -psql
  ```

  or

  ```bash
  nest-init install-prisma --postgresql
  ```

- MongoDB
  `bash
nest-init install-prisma -m
`
  or
  `bash
nest-init install-prisma --mongodb
`

### Drizzle

Configure Drizzle with MySQL, PostgreSQL, or MongoDB.

- MySQL

  ```bash
  nest-init install-drizzle -my
  ```

  or

  ```bash
  nest-init install-drizzle --mysql
  ```

- PostgreSQL

  ```bash
  nest-init install-drizzle -psql
  ```

  or

  ```bash
  nest-init install-drizzle --postgresql
  ```

- MongoDB
  `bash
nest-init install-drizzle -m
`
  or
  `bash
nest-init install-drizzle --mongodb
`

## Setup Authentication Strategies and Services

Nest-Init provides a guided questionnaire to configure authentication services and strategies for your NestJS project. To begin, run the following command:

```bash
nest-init add-auth
```

This command initiates a series of prompts where you can select the options that best fit your project requirements:

### **Normal Authentication**

- Implement local username/password authentication.

### **Social Authentication**

- Implement authentication using Facebook, Google, and Github OAuth services.

### **Resetting Password**

- Enable a built-in password resetting functionality for your project.

### **Authentication Strategies**

- Nest-Init provides flexible authentication strategies to secure your application based on your project's requirements:

**JWT (JSON Web Tokens)**

Implement stateless authentication using JWTs, which are compact tokens verified by the server based on contained claims.

**Sessions**

Supports session-based authentication for managing server-side session states, ideal for applications requiring stateful interactions with clients.

# Contributors
- [Rayan Allali](https://github.com/Rayan-Allali)
- [Nabil Ghemam Djeridi](https://github.com/066516)
- [Wissal Messikh](https://github.com/wissalcodes)
- [Abderrahman Ben Rabah](https://github.com/ViNoS-ab)
- [Abdelghani Derdouche](https://github.com/Ninou01)
- [Ayyoub Kasmi](https://github.com/Ayyoub-Kasmi)

# Join our Community

Join us in the GDG Algiers' Community Discord <a href="https://discord.com/invite/7EvsP7eemQ">here</a> and feel free to ask any questions you may have.

# Contributing

Thank you for considering contributing to the Nest-Init project. We welcome contributions from the community to make this project even better. Please take a moment to review our [CONTRIBUTION.md](CONTRIBUTION.md) file where the Contribution Guidelines are listed.

# License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

# Contact

GDG Algiers - [@gdg_algiers](https://twitter.com/gdg_algiers) - gdg.algiers@esi.dz

Project Link: [https://github.com/GDGAlgiers/nest-init](https://github.com/GDGAlgiers/nest-init)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/GDGAlgiers/nest-init.svg?style=for-the-badge
[contributors-url]: https://github.com/GDGAlgiers/nest-init/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/GDGAlgiers/nest-init.svg?style=for-the-badge
[forks-url]: https://github.com/GDGAlgiers/nest-init/network/members
[stars-shield]: https://img.shields.io/github/stars/GDGAlgiers/nest-init.svg?style=for-the-badge
[stars-url]: https://github.com/GDGAlgiers/nest-init/stargazers
[issues-shield]: https://img.shields.io/github/issues2.0/GDGAlgiers/nest-init.svg?style=for-the-badge
[issues-url]: https://github.com/GDGAlgiers/nest-init/issues
[license-shield]: https://img.shields.io/github/license/GDGAlgiers/nest-init.svg?style=for-the-badge
[license-url]: https://github.com/GDGAlgiers/nest-init/blob/master/LICENSE.md
