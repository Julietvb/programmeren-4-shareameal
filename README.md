# Share a meal
[![Deploy to Heroku](https://github.com/Julietvb/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/Julietvb/programmeren-4-shareameal/actions/workflows)
![GitHub repo size](https://img.shields.io/github/repo-size/Julietvb/programmeren-4-shareameal?label=Total%20Size)
![Github Files](https://img.shields.io/badge/Files-21-pink)


## Table of contents

 - [Project Information](#about-this-project)
    - [Author](#about-the-author)

 - [Installation](#installation)    
    - [Packages](#packages)

 - [Functionalities](#functionalities)
    - [Authentication](#authentication)
    - [User](#user)
    - [Meal](#meal)

## About This Project
This project was made as a school assignment for Avans Hogeschool Breda. This project contains an API with functionalities to add, update and delete meals and users. To use this API in your application follow the [installation](#installation) process. One of the functionalities of this API is authentication. This authentication ensures that users cannot *edit* or *delete* user information or meals from other users. This authentication uses **tokens**, which are provided to a user when they log in. The tokens are generated using [jwt](https://jwt.io).



### About The Author
This project was realized by [Daniël van Zuijdam](https://github.com/Zuijd), student at Avans Hogeschool Breda.



## Installation
### Packages
Below is a list of the packages used to realize this project.

#### Packages For Project Realization
- [ExpressJs](https://expressjs.com/)
- [JWT](https://jwt.io)
- [Mysql2](https://www.npmjs.com/package/mysql2)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Body-parser](https://www.npmjs.com/package/body-parser)

#### Packages For Testing

- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- [Assert](https://www.npmjs.com/package/assert)
- [chai-http](https://www.chaijs.com/plugins/chai-http/)
To install the API: 

1. Download the code by either cloning the [repository](https://github.com/Zuijd/share-a-meal) or downloading this project as a zip.

2. Install the required NPM packages:
```bash
  npm install
```

#### To Run The Application Locally:

1. Start your **MySQL** and **Apache** modules on your [**XAMPP**](https://www.apachefriends.org/index.html)

2. Navigate on your **cmd(er)** to your project directory.

3. Run the following command in your cmd(er):

```bash
  npm start
```

## Functionalities
As mentioned earlier, this API has different functionalities. Below you will find a list of those functionalities and how to use them. 

### Authentication

|**Request Type**|**End-Point**|**Description**
|:-:|---|---|
|POST| /api/auth/login | Log in using emailAdress and password |

### User

|**Request Type**|**End-Point**|**Description**|**Access**|
|:-:|---|---|:-:|
|POST| /api/user | Register as a new user | :unlock: |
|GET| /api/user | Get all users | :lock: |
|GET| /api/user/profile | Request your personal user profile | :lock: |
|GET| /api/user/{id} | Get a single user by id | :lock: |
|PUT| /api/user/{id} | Update a single user | :lock: |
|DELETE| /api/user/{id} | Delete user | :lock: |

### Meal
|**Request Type**|**End-Point**|**Description**|**Access**|
|:-:|---|---|:-:|
|POST| /api/meal | Register meal | :lock: |
|GET| /api/meal | Get all meals | :unlock: |
|GET| /api/meal/{id} | Get a single meal by id | :unlock: |
|PUT| /api/meal/{id} | Update a single meal | :lock: |
|DELETE| /api/meal/{id} | Delete meal | :lock: |
|GET| /api/meal/{id}/participate | Participate in a meal | :lock: |
