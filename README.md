# Photo Quiz — Frontend

Real-time live-room photo quiz built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Socket.IO**.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and point `NEXT_PUBLIC_API_URL` at your Socket.IO backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  Root layout (theme, viewport meta)
│   ├── globals.css                 Tailwind directives + base styles
│   ├── page.tsx                    Landing — Create Room / Join Room
│   └── room/[roomId]/
│       └── page.tsx                Room entry — all quiz phases
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx              Polymorphic button (primary/secondary/ghost)
│   │   └── Input.tsx               Labelled input with error state
│   │
│   ├── NicknameStep.tsx            Nickname form (localStorage persist)
│   ├── Lobby.tsx                   Waiting room + invite link + start button
│   ├── QuizView.tsx                Quiz orchestrator (ties all quiz UI together)
│   ├── FullscreenPhotoStage.tsx    Fixed photo background + vignettes
│   ├── TimerBar.tsx                RAF-driven progress bar (direct DOM, no React re-renders)
│   ├── BottomSheetOptions.tsx      Glassmorphism answer sheet (2×2 grid)
│   ├── PointsFeedback.tsx          Animated +pts overlay after reveal
│   └── Leaderboard.tsx             Final results screen with ranked list
│
├── context/
│   └── RoomContext.tsx             All socket wiring + useReducer state machine
│
├── hooks/
│   └── useTimer.ts                 Generic RAF timer hook (returns 0→1 progress)
│
├── lib/
│   ├── socket.ts                   Socket.IO singleton (typed with event maps)
│   └── utils.ts                    cn(), generateRoomId(), copyToClipboard(), etc.
│
└── types/
    └── index.ts                    All domain types + typed socket event maps
```

---

## Socket Events

All events are fully typed in `src/types/index.ts`.

### Client → Server

| Event | Payload |
|---|---|
| `room:join` | `{ roomId, nickname }` |
| `room:leave` | `{ roomId }` |
| `quiz:start` | `{ roomId }` |
| `answer:submit` | `{ roomId, questionIndex, optionId, clientSentAt }` |

### Server → Client

| Event | Payload |
|---|---|
| `room:state` | `{ roomId, participants, status }` |
| `quiz:started` | `{ roomId, startAt, questionDurationMs, intermissionMs }` |
| `quiz:question` | `{ roomId, questionIndex, question, questionStartAt, questionEndAt }` |
| `quiz:reveal` | `{ roomId, questionIndex, correctOptionId, scoresDelta, answeredStats? }` |
| `quiz:finished` | `{ roomId, leaderboard }` |
| `error` | `{ message }` |

---

## Key Design Decisions

**Timer synchronisation** — `TimerBar` reads server-provided `questionStartAt` / `questionEndAt` timestamps and drives a `requestAnimationFrame` loop that writes `style.width` directly to the DOM, bypassing React's render cycle for maximum smoothness. All clients stay in lockstep regardless of when they loaded the page.

**State machine** — `RoomContext` uses a plain `useReducer` with a discriminated union of actions. The current `phase` (`nickname | lobby | quiz | finished`) drives which component renders.

**Glassmorphism sheet** — `BottomSheetOptions` uses `backdrop-blur-2xl` + a semi-transparent dark background so the photo always shows through while maintaining WCAG-level contrast on answer text.

**Reconnection** — On socket reconnect the `connect` handler re-emits `room:join` so the player rejoins their room automatically. The backend is responsible for re-sending `room:state`.

**Accessibility** — Keyboard-navigable answer buttons, `aria-pressed`, `aria-label`, `role="progressbar"` on the timer, `aria-live` regions for score feedback and errors, and full `prefers-reduced-motion` suppression.
