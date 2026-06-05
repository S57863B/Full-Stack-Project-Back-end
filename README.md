# Pro-Tasker — Backend API

The backend for **Pro-Tasker**, a full-stack MERN project management app. It is
a RESTful API built with Node.js, Express, and MongoDB (via Mongoose). It
handles user authentication with JWTs and enforces strict ownership-based
authorization so each user can only access their own projects and tasks.

## Frontend repo - https://github.com/S57863B/Full-Stack-Project-Font-end

## Tech Stack

- **Node.js + Express** — server and routing
- **MongoDB + Mongoose** — database and schemas
- **JSON Web Tokens (JWT)** — authentication
- **bcryptjs** — password hashing
- **CORS**, **dotenv** — cross-origin support and environment config

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local MongoDB or a free MongoDB Atlas cluster)

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Create a .env file in the project root (see below)

# 3. Start the server
npm start        # production
npm run dev      # development (auto-restarts on file changes)
```

The server runs on `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file in the root with the following keys:

| Variable         | Description                                          | Example |
| ---------------- | ---------------------------------------------------- | ------- |
| `PORT`           | Port the server listens on                           | `5000` |
| `MONGO_URI`      | MongoDB connection string                            | `mongodb+srv://user:pass@cluster.mongodb.net/protasker` |
| `JWT_SECRET`     | Secret used to sign JWTs (a long random string)      | `a1b2c3...` |
| `JWT_EXPIRES_IN` | How long a login token stays valid                   | `3d` |
| `CLIENT_URL`     | The frontend origin, used for CORS                   | `http://localhost:5173` |

> The `.env` file is gitignored and must never be committed.

## Project Structure

```
src/
├── config/        # database connection
├── models/        # Mongoose schemas (User, Project, Task)
├── controllers/   # request logic
├── routes/        # route definitions
├── middleware/    # JWT auth protection
├── utils/         # token helper
└── server.js      # app entry point
```

## API Endpoints

Base URL: `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint         | Protected | Description                      |
| ------ | ---------------- | --------- | -------------------------------- |
| POST   | `/auth/register` | No        | Create an account, returns a JWT |
| POST   | `/auth/login`    | No        | Log in, returns a JWT            |
| GET    | `/auth/me`       | Yes       | Get the current logged-in user   |

### Projects
| Method | Endpoint        | Protected | Description                      |
| ------ | --------------- | --------- | -------------------------------- |
| GET    | `/projects`     | Yes       | List all projects you own        |
| POST   | `/projects`     | Yes       | Create a new project             |
| GET    | `/projects/:id` | Yes       | Get one project (owner only)     |
| PUT    | `/projects/:id` | Yes       | Update a project (owner only)    |
| DELETE | `/projects/:id` | Yes       | Delete a project (owner only)    |

### Tasks (nested under a project)
| Method | Endpoint                             | Protected | Description                       |
| ------ | ------------------------------------ | --------- | --------------------------------- |
| GET    | `/projects/:projectId/tasks`         | Yes       | List tasks in a project you own   |
| POST   | `/projects/:projectId/tasks`         | Yes       | Create a task in a project you own|
| PUT    | `/projects/:projectId/tasks/:taskId` | Yes       | Update a task in a project you own|
| DELETE | `/projects/:projectId/tasks/:taskId` | Yes       | Delete a task in a project you own|

## Authorization

Every project and task route verifies that the logged-in user owns the resource
(or its parent project) before allowing any read or write. Requests for data the
user does not own receive a `403 Forbidden`.

## Deployment

Deployed as a Web Service on Render, connected to a MongoDB Atlas database.

- **Live API:** https://pro-tasker-api-mtq7.onrender.com