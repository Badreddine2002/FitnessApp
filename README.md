# FitnessTracker - Workout Tracking Application (Frontend Only)

A full-stack web application built with React, transformed into a pure frontend application using `localStorage` for data persistence.

## Features
- **User Authentication**: Mock register and login system using `localStorage`.
- **Dashboard**: Overview of your training status and recent exercises.
- **Exercise Management**: Create and manage your list of exercises.
- **Workout Logging**: Log sessions with multiple sets (reps & weight).
- **Progress Visualization**: Dynamic charts showing your personal records (Max Weight & Max Reps) over time.
- **Responsive Design**: Mobile-friendly UI using Vanilla CSS.

## Tech Stack
- **Frontend**: React (Vite), Context API, Axios (replaced by mockApi), Recharts, Lucide-React.
- **Data Persistence**: Browser `localStorage`.

## Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation & Running

1. **Clone the repository** (or extract the files).

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

4. **Access the App**:
   Open your browser and navigate to `http://localhost:3000`.

## How it works
This version of the app does not require a backend server or database. All your data (users, exercises, sessions, and sets) is stored locally in your browser's `localStorage`. This means your data will persist on your device but won't be synced across different browsers or devices.
