# Express Blog Project

## Overview
The Express Blog Project is a fully functional blog that enables users to access and contribute content seamlessly, resembling popular blogging platforms like WordPress or Wix.

## Getting Started
To begin with the project, please follow these steps:

1. **Install Dependencies**: Run the following command to install all project dependencies:
    ```
    npm install
    ```

2. **Database Setup**: Set up a PostgreSQL database named "blog" and execute the provided SQL queries to create the required table structure.

3. **Environment Variables**: Create a `.env` file in the project root directory with the following key-value pairs:
    - `DB_USER`: Username for your PostgreSQL database.
    - `DB_PASS`: Password for your PostgreSQL database.
    - `SECRET`: Secret key used for express-session.
    - `ADMIN_ID`: Username for administrative functionality.
    - `PASSWORD`: Hashed password for administrative functions. You can use an online hasher or write a one-time function to hash a password and log it.

## SQL Queries

### Create Table
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    route VARCHAR(100) NOT NULL UNIQUE,
    date DATE NOT NULL,
    image VARCHAR(255),
    content TEXT,
    blerb VARCHAR(255),
    topic VARCHAR(50)
);
