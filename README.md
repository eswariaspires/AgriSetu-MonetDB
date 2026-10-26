# AgriSetu — Farmer–Buyer Direct Connection Platform

AgriSetu is a full-stack web application that connects farmers directly with buyers. Farmers can list their agricultural produce, buyers can browse available products and send connection requests, and users can manage connections, notifications, and reviews.

This version uses **MonetDB** as its database.

## Features

- User registration and login
- Farmer and buyer roles
- Add, view, edit, and delete produce listings
- Browse available agricultural produce
- Send and manage farmer–buyer connection requests
- Accept or reject connection requests
- Notifications for relevant activities
- Submit and view reviews

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS / Tailwind CSS, as configured in the project

**Backend**
- Node.js
- Express.js
- JWT authentication
- bcryptjs for password hashing

**Database**
- MonetDB
- SQL

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MonetDB Server
- Git (optional, for cloning the repository)

## MonetDB Setup

### 1. Install and Start MonetDB

Install MonetDB for your operating system and start the MonetDB server.

The default configuration used by this project is:

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `50000` |
| Database | `demo` |
| Username | `monetdb` |
| Password | Your local MonetDB password |

Update these settings if your local MonetDB installation uses different values.

### 2. Create the Database Schema

Connect to your MonetDB database using MonetDB SQL Client or another compatible SQL client.

Create the `agrisetu` schema and the tables required by the application:

- `agrisetu.users`
- `agrisetu.produce`
- `agrisetu.connections`
- `agrisetu.reviews`
- `agrisetu.notifications`

**Important:** Use the project's actual SQL schema file if available. Run `backend/config/schema.sql` only if that is where your schema file is stored; otherwise, use the correct path to your project's schema script.

The database must contain the required tables and columns before you start using the application.

## Environment Configuration

### 1. Configure the Backend

Open the `backend` directory.

Create a file named `.env` by copying `.env.example`.

Add your local configuration:

```env
PORT=5000

JWT_SECRET=replace_with_a_secure_random_secret

MONETDB_HOST=localhost
MONETDB_PORT=50000
MONETDB_DATABASE=demo
MONETDB_USER=monetdb
MONETDB_PASSWORD=your_local_monetdb_password
```

Replace the placeholder values with your own settings.

**Never commit your actual `.env` file or database password to GitHub.**

## Run the Application

### 1. Start the Backend

Open a terminal in the `backend` directory:

```bash
npm install
npm run dev
```

The backend should start on port `5000`, unless you configure a different port.

### 2. Start the Frontend

Open a second terminal in the project's root directory:

```bash
npm install
npm run dev
```

Vite will display the local frontend address in the terminal. Open that address in your browser.

## Database Persistence

AgriSetu stores application data in MonetDB. User accounts, produce listings, connections, reviews, and notifications are stored in the corresponding database tables.

The backend enables autocommit for its MonetDB connection so successful database changes persist without requiring a separate manual commit for each operation.

## Project Structure

```text
agrisetu-MonetDB/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── src/
├── public/
├── package.json
├── .gitignore
└── README.md
```

The exact folder structure may vary slightly depending on the current implementation.

## Security Notes

- Keep `.env` files and credentials private.
- Use a strong JWT secret.
- Never store plain-text user passwords; the backend should hash passwords before saving them.
- Do not expose private database credentials in frontend code.
- Use HTTPS and appropriate production security settings before public deployment.

## Future Improvements

- Improve mobile responsiveness
- Add advanced produce search and filtering
- Add production deployment configuration
- Improve validation and error handling
- Add analytics for farmers and buyers

## Project Purpose

AgriSetu demonstrates a full-stack application that combines a web interface, backend APIs, authentication, and a relational SQL database using MonetDB.