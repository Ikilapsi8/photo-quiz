'use client';

import { useRoom } from '@/context/RoomContext';
import { FullscreenPhotoStage } from './FullscreenPhotoStage';
import { TimerBar } from './TimerBar';
import { BottomSheetOptions } from './BottomSheetOptions';
import { PointsFeedback } from './PointsFeedback';

/** Total questions in the quiz — should match backend config. */
const TOTAL_QUESTIONS = 12;

export function QuizView() {
  const { state, submitAnswer, lockAnswer, clearDelta } = useRoom();
  const { currentQuestion, selectedOptionId, isAnswerLocked, revealData, myDelta, questionIndex, myScore } =
    state;

  // No question yet — quiz:started fired but first quiz:question hasn't arrived
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
      {/* Fullscreen photo */}
      <FullscreenPhotoStage
        imageUrl={question.imageUrl}
        alt={`Photo for question ${questionIndex + 1}`}
      />

      {/* Timer bar — uses server timestamps for deterministic sync */}
      <TimerBar startAt={questionStartAt} endAt={questionEndAt} onEnd={lockAnswer} />

      {/* Score chip — top right */}
      <div
        className="fixed right-4 z-50"
        style={{ top: 'calc(1rem + var(--sat, 0px))' }}
        aria-label={`Your score: ${myScore} points`}
      >
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
          <span className="text-white font-bold text-sm tabular-nums">
            {myScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Bottom-sheet answers */}
      <BottomSheetOptions
        prompt={question.prompt}
        options={question.options}
        selectedOptionId={selectedOptionId}
        correctOptionId={revealData?.correctOptionId}
        isLocked={isAnswerLocked}
        onSelect={submitAnswer}
        questionIndex={questionIndex}
        totalQuestions={TOTAL_QUESTIONS}
      />

      {/* Points animation after reveal */}
      {myDelta !== null && <PointsFeedback delta={myDelta} onDone={clearDelta} />}
    </div>
  );
}
