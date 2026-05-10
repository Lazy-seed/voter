# Live Polling System

A real-time polling application built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and Docker.

## Features
- **Real-time Updates**: Admin dashboard updates live when votes are cast using WebSockets.
- **Session-based Voting**: Ensures "One vote per session" to prevent users from voting multiple times.
- **Premium UI**: Dark-mode glassmorphism design for a modern look and feel.
- **Dockerized**: Fully containerized with Docker and Docker Compose for easy setup.
- **Seeder Included**: Comes with a built-in seeder script to populate Admin user, default Nominees, and sample voting data.

## Technologies Used
- **Frontend**: React (Vite), React Router, Chart.js (react-chartjs-2), Socket.io-client, Vanilla CSS.
- **Backend**: Node.js, Express, Mongoose, Socket.io, Express-Session.
- **Database**: MongoDB.
- **Orchestration**: Docker, Docker Compose.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your system.

### Running the Application via Docker (Recommended)

1. **Clone the repository** (if applicable) and navigate to the project root.
2. **Spin up the containers**:
   ```bash
   docker-compose up --build -d
   ```
   *This will start MongoDB, the Backend server on port 8000, and the Frontend Nginx server on port 3000.*
3. **Seed the Database**:
   ```bash
   docker exec -it live-polling-backend npm run seed
   ```
   *This populates the Admin user, the Poll, 5 Nominees, and some sample votes.*
4. **Access the Application**:
   - **Audience Voting Page**: `http://localhost:3000`
   - **Admin Dashboard**: `http://localhost:3000/admin`
     - **Login Credentials**: 
       - Username: `admin`
       - Password: `password123`

### Running Locally (Without Docker)

1. Ensure MongoDB is running locally on port `27017`.
2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run seed  # Seed the database
   npm run dev   # Starts server on port 8000
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev   # Starts Vite dev server on port 5173
   ```
4. Access the app at `http://localhost:5173`.

## Architecture Details
- **One Vote Per Session**: The backend tracks voting using `express-session`. A cookie is stored in the voter's browser. Once a vote is cast, the session ID is recorded in the `Vote` collection, preventing duplicates.
- **WebSockets**: `Socket.io` is used instead of Webhooks to ensure efficient, bidirectional, and instant communication to the Admin Dashboard whenever a new vote is added.
