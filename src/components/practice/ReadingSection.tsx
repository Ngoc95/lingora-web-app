"use client";

/**
 * Reading Section Layout
 * Split view with passage on left and questions on right
 * Each panel scrolls independently with fixed height
 */

import { ExamSectionGroup } from "@/types/exam";
import { QuestionRenderer } from "./QuestionRenderer";

interface ReadingSectionProps {
  group: ExamSectionGroup;
  answers: { [questionId: number]: unknown };
  onAnswer: (questionId: number, value: unknown) => void;
}

// Helper function to convert \n\n to proper HTML line breaks
function formatContent(content: string): string {
  return content
    .replace(/\\n\\n/g, '</p><p class="my-3">')
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/\\n/g, '<br/>')
    .replace(/\n/g, '<br/>');
}

export function ReadingSection({
  group,
  answers,
  onAnswer,
}: ReadingSectionProps) {
  // Get resourceUrl from group or group metadata
  const groupImageUrl = group.resourceUrl || 
    (group.metadata && typeof group.metadata === "object" && "imageUrl" in group.metadata 
      ? String(group.metadata.imageUrl) 
      : null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-220px)]">
      {/* Passage Panel - Independent Scroll */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-full">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex-shrink-0">
          <h3 className="font-semibold text-white">
            📖 {group.title || "Reading Passage"}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {group.description && (
            <p className="text-neutral-600 italic mb-4 text-sm">{group.description}</p>
          )}
          
          {/* Display group image if available */}
          {groupImageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border border-neutral-200">
              <img 
                src={groupImageUrl} 
                alt="Passage image"
                className="w-full max-h-64 object-contain bg-neutral-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {group.content && (
            <div
              className="prose prose-neutral prose-sm max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="my-3">${formatContent(group.content)}</p>` 
              }}
            />
          )}
        </div>
      </div>

      {/* Questions Panel - Independent Scroll */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-full">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 flex-shrink-0">
          <h3 className="font-semibold text-white">✏️ Câu hỏi</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
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
                
                {/* Display questionGroup resourceUrl if available */}
                {qg.resourceUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-neutral-200">
                    <img 
                      src={qg.resourceUrl} 
                      alt="Question group image"
                      className="w-full max-h-48 object-contain bg-neutral-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="space-y-5">
                  {qg.questions.map((q, idx) => (
                    <QuestionRenderer
                      key={q.id}
                      question={q}
                      index={getQuestionNumber(group, qgIdx, idx)}
                      answer={answers[q.id]}
                      onAnswer={(value) => onAnswer(q.id, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Get global question number
function getQuestionNumber(
  group: ExamSectionGroup,
  qgIndex: number,
  qIndex: number
): number {
  let num = 1;
  for (let i = 0; i < qgIndex; i++) {
    num += group.questionGroups?.[i]?.questions.length || 0;
  }
  return num + qIndex;
}
