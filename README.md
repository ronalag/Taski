# Taski

A task management application.

## Dependencies

* Curl
* Unzip
* NodeJS
* NPM
* MySQL

## Setup, build and run application

Create a config.js file based on the config.js.example file in the base directory. It contains fields for connecting to MySQL and hashing passwords. When you are done run the following commands in a terminal:

```
curl -LOk https://github.com/ronalag/Taski/archive/master.zip
unzip master.zip
cd Taski-master
npm install
npm script createDB
npm start
```

Then navigate to http://localhost:3000 on your local machine, sign up for an account then you can use the credentials to login.
