# FitnessTracker - Workout Tracking Application

A full-stack web application built with React and Node.js to help users track their muscle training workouts.

## Features
- **User Authentication**: Secure register and login system.
- **Dashboard**: Overview of your training status and recent exercises.
- **Exercise Management**: Create and manage your list of exercises.
- **Workout Logging**: Log sessions with multiple sets (reps & weight).
- **Progress Visualization**: Dynamic charts showing your personal records (Max Weight & Max Reps) over time.
- **Responsive Design**: Mobile-friendly UI using Vanilla CSS.

## Tech Stack
- **Frontend**: React (Vite), Context API, Axios, Recharts, Lucide-React.
- **Backend**: Node.js, Express, SQLite, JWT, BcryptJS.

## Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation & Running

1. **Clone the repository** (or extract the files).

2. **Setup the Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```
   The backend will run on `http://localhost:5000`.

3. **Setup the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

4. **Access the App**:
   Open your browser and navigate to `http://localhost:3000`.

## API Documentation
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login and receive a JWT.
- `GET /api/exercises`: Get all exercises for the logged-in user.
- `POST /api/exercises`: Create a new exercise.
- `GET /api/sessions/:exerciseId`: Get all sessions for an exercise.
- `POST /api/sessions`: Create a new session.
- `POST /api/sets`: Add a set to a session.
- `GET /api/progress/:exerciseId`: Get progress data for charts.
- `GET /api/records/:exerciseId`: Get personal records for an exercise.
