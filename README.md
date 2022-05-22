# Share a meal
[![Deploy to Heroku](https://github.com/Julietvb/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/Julietvb/programmeren-4-shareameal/actions/workflows)
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
This project was made as a school assignment for Avans Hogeschool Breda. This project contains an API with functionalities to add, update and delete meals and users. 
> To use this API in your application, follow the [installation](#installation) process. 
One of the functionalities of this API is authentication. This authentication ensures that users cannot *edit* or *delete* user information or meals from other users. This authentication uses **tokens**, which are provided to a user when they log in. The tokens are generated using [jwt](https://jwt.io).



### About The Author
This project was made by [Juliet van Bezooijen](https://github.com/Julietvb).



## Installation
To use the API in your application, there are a few preparatory steps necessary. This includes installing **packages**, dowloading **XAMPP** and installing a **cmd(er)**.

### Packages
The packages installed are divided into 2 categories. When you don't want to use tests in your application, the *last 4 packages* aren't necessary to run the project.
> If you decide to remove the testing, make sure to delete the test\integration folder when you don't want unecessary documents. 

- [ExpressJs](https://expressjs.com/)
- [JWT](https://jwt.io)
- [Mysql2](https://www.npmjs.com/package/mysql2)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Body-parser](https://www.npmjs.com/package/body-parser)




- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- [Assert](https://www.npmjs.com/package/assert)
- [chai-http](https://www.chaijs.com/plugins/chai-http/)

To install the packages, enter the following in your command center. 

```bash
  npm install *enter your package name here*
```

### Project installation
To use the API in your application follow the following steps:

1. Download the code by cloning the [repository](https://github.com/Julietvb/programmeren-4-shareameal) or downloading this project as a zip and opening it in your editor.

2. Open [**XAMPP**](https://www.apachefriends.org/index.html), and click the *start* button next to *MYSQL* and *Apache*. 

3. Open your project directory in your **cmd(er)**. This is done by using the command
```bash
  cd ..
```

3. Run the following command in your cmd(er):

```bash
  npm start
```

## Functionalities
The following functionalities are realized in the API. The functionalities are divided into 3 subcategories based on their result.

### Authentication

|**Request Type**|**End-Point**|**Description**
|:-:|---|---|
|POST| /api/auth/login | Get a token by entering your email and password |

### User

|**Request Type**|**End-Point**|**Description**|**Access**|
|:-:|---|---|:-:|
|POST| /api/user | Register as a new user | :unlock: |
|GET| /api/user | Get a list of all users | :lock: |
|GET| /api/user/profile | Request your personal information | :lock: |
|GET| /api/user/{id} | Get a users information by searching their id | :lock: |
|PUT| /api/user/{id} | Update a user | :lock: |
|DELETE| /api/user/{id} | Delete user | :lock: |

### Meal
|**Request Type**|**End-Point**|**Description**|**Access**|
|:-:|---|---|:-:|
|POST| /api/meal | Add a meal | :lock: |
|GET| /api/meal | Get a list all meals | :unlock: |
|GET| /api/meal/{id} | Get a meals information by searching it's id | :unlock: |
|PUT| /api/meal/{id} | Update a meal | :lock: |
|DELETE| /api/meal/{id} | Delete meal | :lock: |
