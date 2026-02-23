'use client';

import { useRoom } from '@/context/RoomContext';
import { FullscreenPhotoStage } from './FullscreenPhotoStage';
import { TimerBar } from './TimerBar';
import { AnswerOverlayOptions } from './AnswerOverlayOptions';
import { PointsFeedback } from './PointsFeedback';

const TOTAL_QUESTIONS = 12;

export function QuizView() {
  const { state, submitAnswer, lockAnswer, clearDelta } = useRoom();
  const { currentQuestion, selectedOptionId, isAnswerLocked, revealData, myDelta, questionIndex, myScore } =
    state;

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-white/40 text-sm">Loading question…</p>
        </div>
      </div>
    );
  }

  const { question, questionStartAt, questionEndAt } = currentQuestion;

  return (
    <div
      className="fixed inset-0 bg-black"
      role="main"
      aria-label={`Question ${questionIndex + 1} of ${TOTAL_QUESTIONS}`}
    >
      {/* True full-screen photo — edge to edge */}
      <FullscreenPhotoStage
        imageUrl={question.imageUrl}
        alt={`Photo for question ${questionIndex + 1}`}
      />

      {/* Timer bar */}
      <TimerBar startAt={questionStartAt} endAt={questionEndAt} onEnd={lockAnswer} />

      {/* Top HUD: question counter (left) + score (right) */}
      <div
        className="fixed left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{ top: 'calc(0.75rem + var(--sat, 0px))' }}
      >
        {/* Question counter */}
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
          <span
            className="text-white/60 text-xs font-semibold uppercase tracking-wider"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            Question{' '}
          </span>
          <span
            className="text-white font-bold text-sm tabular-nums"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {questionIndex + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>

        {/* Score */}
        <div
          className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15"
          aria-label={`Your score: ${myScore} points`}
        >
          <span
            className="text-white font-bold text-sm tabular-nums"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {myScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Answer buttons — floating glass over the photo */}
      <AnswerOverlayOptions
        prompt={question.prompt}
        options={question.options}
        selectedOptionId={selectedOptionId}
        correctOptionId={revealData?.correctOptionId}
        isLocked={isAnswerLocked}
        onSelect={submitAnswer}
      />

      {/* Points animation after reveal */}
      {myDelta !== null && <PointsFeedback delta={myDelta} onDone={clearDelta} />}
    </div>
  );
}
