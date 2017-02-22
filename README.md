# Taski

A task management application.

## Dependencies

* Git
* NodeJS
* NPM
* MySQL

## Setup and build

Create a config.js file based on the config.js.example file in the base directory. It contains fields for connecting to MySQL and hashing passwords. When you are done run the following commands in a terminal:

``` 
git clone git@github.com:ronalag/Taski.git
cd Taski
npm install
npm script createDB 
node app.js
```

Then navigate to http://localhost:3000 on your local machine, sign up for an account then you can use the credentials to login.
