"use client";

/**
 * Writing Section Layout
 * Task prompt with rich text editor and image display
 */

import { ExamSectionGroup } from "@/types/exam";

interface WritingSectionProps {
  group: ExamSectionGroup;
  answers: { [questionId: number]: unknown };
  onAnswer: (questionId: number, value: unknown) => void;
}

export function WritingSection({
  group,
  answers,
  onAnswer,
}: WritingSectionProps) {
  // Get the first question (usually one essay per task)
  const question = group.questionGroups?.[0]?.questions[0];

  if (!question) {
    return (
      <div className="text-center text-neutral-500 py-8">
        Không có câu hỏi cho phần này
      </div>
    );
  }

  const answer = (answers[question.id] as string) || "";
  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  // Get min words from metadata
  const minWords =
    question.metadata &&
    typeof question.metadata === "object" &&
    "minWords" in question.metadata
      ? Number(question.metadata.minWords)
      : 150; // Default to 150 for IELTS

  return (
    <div className="space-y-6">
      {/* Task Card */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div 
            className="w-8 h-8 text-white rounded-lg flex items-center justify-center font-bold"
            style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
          >
            W
          </div>
          <h3 className="font-semibold text-green-700">
            {group.title || "Writing Task"}
          </h3>
        </div>

        {group.description && (
          <p className="text-green-700 mb-4">{group.description}</p>
        )}

        {/* Task Content/Instructions */}
        {group.content && (
          <div
            className="prose prose-neutral max-w-none bg-white rounded-lg p-4 border border-green-200"
            dangerouslySetInnerHTML={{ __html: group.content }}
          />
        )}

        {/* Question Prompt */}
        {question.prompt && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
            <p className="font-medium text-neutral-800">{question.prompt}</p>
          </div>
        )}
      </div>

      {/* Task Image - Display chart/graph if available */}
      {group.resourceUrl && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-green-700">📊 Chart / Graph</span>
          </div>
          <div className="bg-white rounded-lg p-2 border border-green-200">
            <img
              src={group.resourceUrl}
              alt="Task image"
              className="w-full max-h-80 object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Word Count Indicator */}
      <div
        className={`rounded-xl p-4 border ${
          wordCount >= minWords
            ? "bg-green-50 border-green-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-neutral-600">Số từ đã viết</span>
            <p
              className={`text-2xl font-bold ${
                wordCount >= minWords ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {wordCount} từ
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-neutral-600">Yêu cầu tối thiểu</span>
            <p className="text-lg font-semibold text-neutral-700">{minWords} từ</p>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <span className="font-medium text-neutral-700">Bài viết của bạn</span>
        </div>
        <textarea
          value={answer}
          onChange={(e) => onAnswer(question.id, e.target.value)}
          placeholder="Bắt đầu viết bài của bạn ở đây..."
          className="w-full h-96 p-6 focus:outline-none resize-none text-lg leading-relaxed"
        />
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-700 mb-2">💡 Lưu ý</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Đọc kỹ đề bài trước khi viết</li>
          <li>• Chia bài viết thành các đoạn rõ ràng</li>
          <li>• Kiểm tra lỗi chính tả trước khi nộp</li>
          <li>• Viết ít nhất {minWords} từ</li>
        </ul>
      </div>
    </div>
  );
}
