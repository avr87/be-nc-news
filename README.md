# Northcoders News API
This project has been built to practice creating a database and an api. Using the hosted version you will be able to see all the endpoints. You can get articles, users, topics, articles by id, comments by article id, add a comment or vote and delete a comment. To try it out for yourself follow the steps from "Required versions of Node and Postgres".


HOSTED VERSION
Link to the hosted version using Render: https://anna-nc-news-project.onrender.com/api
This link will direct you to all available endpoints, such as "/api/users"

REQUIRED VERSIONS OF NODE AND POSTGRES:
Node.js (min. v17.0.29 or newer)  ---> https://nodejs.org/en/download/current
PostgreSQL (min. v14.10 or newer) ---> https://www.postgresql.org/download/
If not already installed, download and install them using the provided links.

CLONE THE REPOSITORY ON LOCAL MACHINE:
Navigate to the folder you want this repo to be in via the command line. 
Run: git clone https://github.com/avr87/be-nc-news.git
Once cloned, open the folder in  Visual Studio Code (VSCode).

INSTALL DEPENDENCIES:
To install all the required dependencies, run the following command: npm i

CREATE TWO LOCAL DATABASES
To connect with the local databases, create two files: ".env.test" and ".env.development". 
Add PGDATABASE=nc_news into .env.development and PGDATABASE=nc_news_test into .env.test.

SETUP & SEED LOCAL DATABASE:
To seed the database, run the following commands in your terminal: 
- npm run setup-dbs  
- npm seed run seed

RUN TEST: 
Execute the following command in your terminal to run the tests: npm test
There are two test files. If you want to run a specific file run: 
- npm run app for app.test.js 
- utils.test.js run: npm run utils for utils.test.js