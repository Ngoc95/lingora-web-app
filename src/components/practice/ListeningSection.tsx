"use client";

/**
 * Listening Section Layout
 * Audio player is now in topbar - this component only handles questions
 */

import { ExamSectionGroup } from "@/types/exam";
import { QuestionRenderer } from "./QuestionRenderer";

interface ListeningSectionProps {
  group: ExamSectionGroup;
  answers: { [questionId: number]: unknown };
  onAnswer: (questionId: number, value: unknown) => void;
}

export function ListeningSection({
  group,
  answers,
  onAnswer,
}: ListeningSectionProps) {
  return (
    <div className="space-y-6">
      {/* Questions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
        {/* Group Header */}
        {group.title && (
          <h3 className="font-semibold text-neutral-900 text-lg mb-2">
            {group.title}
          </h3>
        )}
        {group.description && (
          <p className="text-neutral-600 mb-4">{group.description}</p>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {group.questionGroups?.map((qg, qgIdx) => (
            <div key={qg.id} className="space-y-4">
              {qg.title && (
                <h4 className="font-medium text-neutral-700 bg-neutral-100 px-3 py-2 rounded-lg text-sm">
                  {qg.title}
                </h4>
              )}
              {qg.description && (
                <p className="text-sm text-neutral-600 italic">
                  {qg.description}
                </p>
              )}
              
              {/* Display questionGroup resourceUrl if available (for images, not audio) */}
              {qg.resourceUrl && !qg.resourceUrl.includes('.mp3') && !qg.resourceUrl.includes('audio') && (
                <div className="mb-4 rounded-lg overflow-hidden border border-neutral-200">
                  <img 
                    src={qg.resourceUrl} 
                    alt="Question group image"
                    className="w-full max-h-64 object-contain bg-neutral-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-5">
                {qg.questions.map((q, idx) => {
                  let num = 1;
                  for (let i = 0; i < qgIdx; i++) {
                    num += group.questionGroups?.[i]?.questions.length || 0;
                  }
                  return (
                    <QuestionRenderer
                      key={q.id}
                      question={q}
                      index={num + idx}
                      answer={answers[q.id]}
                      onAnswer={(value) => onAnswer(q.id, value)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
