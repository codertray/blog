# Express Blog Project

## Overview
The goal of this project is to create a fully functional blog that allows users to access and contribute content from anywhere, similar to popular blogging platforms like WordPress or Wix.

## Getting Started
To get started with the project, follow these steps:

1. Clone the project repository to your local machine.
2. Run npm install to install all project dependencies.
3. Set up a PostgreSQL database with the name "blog" and execute the provided SQL queries to create the necessary table.
4. Create a .env file in the project root directory with the following key-value pairs:
    - DB_USER: The username for your PostgreSQL database.
    - DB_PASS: The password for your PostgreSQL database.
    - SECRET: A secret key used for express-session.
    - ADMIN_ID: A username to access administrative functionality.
    - PASSWORD: A hashed password for administrative functions. You can use an online hasher or write a one-time function to hash a password and console log it.

## Queries

### Create Table
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

### Generate Test Posts
Before launching the project, consider generating some test posts using AI-generated content.

## What's Working?
- The majority of the front-end routes are fully functional.
- Administrative, login, and panel routes are operational.

## In Progress
- Writing the script to make the form fully functional.

## Upcoming
- Implementation of scripting and styling to make the application more interactive.
- Adjustments to the delete and update routes to handle no longer needed assets.
- Addition of content, icons, etc. Core functionality is prioritized first.

Your suggestions and feedback are welcome as the project progresses.


