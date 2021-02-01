# RESTful API Project

The RESTful API provides a way for users to administer a school database containing information about courses. Users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.
In order to make changes to the database users are required to create an account and log-in via postman

## Technologies

Node.js,
Express,
Postman,
SQLite,
Sequelize ORM for data modeling, validation and persistence.

## Getting Started

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:3000/](http://localhost:3000/).
