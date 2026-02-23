# Photo Quiz Backend

Real-time live-room photo quiz server using Socket.IO, Express, Prisma, and SQLite.

## Setup

```bash
# Install dependencies
npm install

# Create SQLite database and seed 12 questions
npm run db:setup

# Start dev server (port 3001)
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS |
| `npm run db:setup` | Migrate + seed database |
| `npm run db:seed` | Re-seed questions only |
| `npm test` | Run unit tests |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `PORT` | `3001` | HTTP server port |

## Connecting from Frontend

Connect via Socket.IO to `http://localhost:3001`.

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// Join a room
socket.emit("room:join", { roomId: "my-room", nickname: "Alice" });

// Listen for room state
socket.on("room:state", (data) => { /* { roomId, participants, status } */ });

// Start quiz (anyone can start)
socket.emit("quiz:start", { roomId: "my-room" });

// Listen for questions
socket.on("quiz:question", (data) => {
  // { roomId, questionIndex, question: { id, imageUrl, prompt, options }, questionStartAt, questionEndAt }
});

// Submit answer
socket.emit("answer:submit", {
  roomId: "my-room",
  questionIndex: 0,
  optionId: "q0b",
  clientSentAt: Date.now(),
});

// Listen for reveals and final leaderboard
socket.on("quiz:reveal", (data) => { /* { correctOptionId, scoresDelta } */ });
socket.on("quiz:finished", (data) => { /* { leaderboard } */ });
```

## Socket Events

### Client → Server

| Event | Payload |
|-------|---------|
| `room:join` | `{ roomId, nickname }` |
| `room:leave` | `{ roomId }` |
| `quiz:start` | `{ roomId }` |
| `answer:submit` | `{ roomId, questionIndex, optionId, clientSentAt }` |

### Server → Client

| Event | Payload |
|-------|---------|
| `room:state` | `{ roomId, participants, status }` |
| `quiz:started` | `{ roomId, startAt, questionDurationMs, intermissionMs }` |
| `quiz:question` | `{ roomId, questionIndex, question, questionStartAt, questionEndAt }` |
| `quiz:reveal` | `{ roomId, questionIndex, correctOptionId, scoresDelta }` |
| `quiz:finished` | `{ roomId, leaderboard }` |
| `error` | `{ message }` |

## Scoring

- Correct answer: **100** base + speed bonus (up to **50**)
- Speed bonus: `floor(50 * (1 - responseTimeMs / questionDurationMs))`
- Wrong or no answer: **0** points
- Late answers (after `questionEndAt`): rejected
