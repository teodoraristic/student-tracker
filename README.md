# Student Tracker

A full-stack web application for university students to manage subjects, assignments, and study sessions — with AI-powered task breakdown and deadline risk assessment.

## Tech Stack

**Backend**
- Java 21, Spring Boot 4.0.3
- Spring Security with JWT authentication
- Spring Data JPA + PostgreSQL
- Lombok

**Frontend**
- React 19, Vite 7
- React Router 7
- Axios

**AI**
- Claude API (Haiku) for task breakdown and risk assessment

## Features

- **Subject management** — track courses with status (In Progress / Passed / Failed) and grade calculation
- **Task & subtask system** — hierarchical task management with priority, difficulty, and due dates
- **Daily planner** — view and check off subtasks by day
- **Calendar & weekly planner** — visualize deadlines across the month and week
- **Study Room** — built-in Pomodoro-style timer with session logging
- **AI assistant** — automatically breaks a task into subtasks and flags at-risk assignments based on deadlines

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE "student-tracker";
   ```

2. Configure credentials in `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/student-tracker
       username: your_username
       password: your_password
   ```

3. Create `backend/src/main/resources/application-secret.properties` with your JWT secret and Claude API key:
   ```properties
   jwt.secret=your_jwt_secret_key
   claude.api.key=your_claude_api_key
   ```

4. Run the backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   The API will be available at `http://localhost:8080`.

### Frontend Setup

1. Install dependencies and start the dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Project Structure

```
app/
├── backend/                  # Spring Boot REST API
│   └── src/main/java/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic + AI integration
│       ├── model/            # JPA entities
│       ├── dto/              # Request/Response DTOs
│       ├── repository/       # Spring Data JPA repositories
│       ├── security/         # JWT filter, UserDetailsService
│       └── exception/        # Custom exceptions + global handler
│
└── frontend/                 # React SPA
    └── src/
        ├── pages/            # Route-level page components
        ├── components/       # Reusable UI components
        ├── services/         # API service layer (Axios)
        ├── auth/             # Auth context and hook
        └── utils/            # Shared helpers (enums, date utils)
```

## API Overview

| Resource | Base Path |
|---|---|
| Auth (register/login) | `/api/auth` |
| Subjects | `/api/subjects` |
| Tasks | `/api/tasks` |
| Subtasks | `/api/subtasks` |
| Study Sessions | `/api/study-sessions` |
| AI | `/api/ai` |

All protected endpoints require a `Bearer <token>` header. Tokens expire after 24 hours.
