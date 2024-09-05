# PawSitters
## Running the API
To get the API up and running, follow these steps:
1. Install Node.js Dependencies:
- Navigate to the ./backend directory and run the following command to install the necessary dependencies:
```
npm install
```
2. Set Up the Database:
- Before running the project, ensure the PawSitters database is created in your MySQL server. Then, configure your ./backend/.env file to specify the database credentials, host, and server port. The default configuration values are as follows:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=PawSitters
SERVER_PORT=8081
```
3. Install nodemon
- nodemon is used to automatically restart the server when file changes are detected. Install it globally by running:
```
npm install -g nodemon
```
4. Start the API:
- To start the API and create the initial database tables, navigate back to ./backend and run:
```
npm run dev
```
### Important notes:
1. Set synchronize to false:
- After running the API for the first time, immediately go to ./backend/data-source.ts and set synchronize to false:
```
synchronize: false
```
- This prevents TypeORM from trying to recreate the tables every time the API is restarted, which would result in errors if the tables already exist.
2. Comment Out createUsers():
- In the ./backend/index.ts file, comment out the createUsers() function after running it once. This function populates the database with test data. Running it multiple times will cause conflicts with unique constraints on some tables.
```
appRouter.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  comment this line out => createUsers(); 
});
```
- The createUsers() function populates the database with test data. This ensures that test data is only inserted once and avoids errors on subsequent runs.

### Start working with the API
- GET routes example:
```
localhost:8081/api/v1/users // You can specify ?role=owner(sitter or admin)
localhost:8081/api/v1/users/<user_id>
localhost:8081/api/v1/users/<user_id>/pets
localhost:8081/api/v1/users/<user_id>/pets/<pet_id>
```
- POST routes
```
localhost:8081/api/v1/users // You can must specify either ?register to create a new user or ?login to fetch the data of a user for login
localhost:8081/api/v1/users/<user_id>/pets
localhost:8081/api/v1/users/<user_id>/address
```
To create a user, follow the format of the data in ./backend/src/data.json
If any information is missing for the creation of any entity, the API will return valid json that will guide you to create the entity.
For the option ?login, the email and password of the user must be specified. Make sure to get the information from ./backend/src/data.json to test.
