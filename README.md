# Unmasked

A chess game analysis and coaching platform that tells you exactly where your games went wrong — not just an eval bar, but plain-language move-by-move feedback.

## Description

Most chess analysis tools give you a raw evaluation number and expect you to figure out what it means. Unmasked solves that by running your games through the Stockfish chess engine and classifying every move as **Best**, **Inaccuracy**, **Mistake**, or **Blunder** in plain language, so improving players can actually understand where they went wrong instead of just seeing a number swing on a graph.

It's built for improving club and casual chess players (roughly 800-1800 rating), and grew out of a real need I saw teaching chess to my own students and running a chess YouTube channel — most of my audience wanted to understand *why* a move was bad, not just that it was.

## Features

- **User accounts** — register and log in securely with JWT-based authentication
- **PGN game upload** — paste a game in standard PGN format for analysis
- **Move-by-move analysis** — every move run through Stockfish, with evaluation swings calculated and normalized correctly regardless of whose turn it is
- **Plain-language classification** — each move flagged as Best, Inaccuracy, Mistake, or Blunder
- **Saved game history** — logged-in users can see a dashboard of previously analyzed games
- **Fully deployed** — live on the web, not just a local demo

## Tech Stack

**Backend**
- Java, Spring Boot, Spring Security (JWT authentication)
- Maven
- Stockfish (chess engine, run via UCI protocol)
- chesslib (PGN parsing)

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router, Axios

**Databases**
- PostgreSQL (Neon) — users and games
- MongoDB (Atlas) — move-by-move analysis documents

**Infrastructure**
- Docker (containerized backend and frontend)
- Deployed on Render

## How to Run Locally

### Prerequisites
- Java 21+
- Node.js 20+
- Maven
- Stockfish installed locally
- A PostgreSQL database (e.g. a free Neon instance)
- A MongoDB database (e.g. a free Atlas cluster)

### Backend
```bash
cd backend
# Add your database credentials and Stockfish path to
# src/main/resources/application.properties
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Running with Docker instead
```bash
# Create a .env file in the project root with your database
# credentials (see .env.example if provided)
docker-compose up --build
```

## Author

**devRubey**
Web developer & chess educator
Runs the chess YouTube channel [The Masked Chess Player](https://www.youtube.com/@MaskedChessPlayer)
