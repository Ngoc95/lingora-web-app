export default function VocabularyPage() {
  const categories = [
    { id: 1, name: "Giao tiếp cơ bản", topics: 12, icon: "💬" },
    { id: 2, name: "Du lịch", topics: 8, icon: "✈️" },
    { id: 3, name: "Công việc", topics: 15, icon: "💼" },
    { id: 4, name: "Ẩm thực", topics: 10, icon: "🍽️" },
    { id: 5, name: "Sức khỏe", topics: 7, icon: "🏥" },
    { id: 6, name: "Giáo dục", topics: 11, icon: "📚" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
          Học từ vựng
        </h1>
        <p className="text-[var(--neutral-600)]">
          Chọn danh mục để bắt đầu học
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`/vocabulary/category/${category.id}`}
            className="group rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm transition-all hover:border-[var(--primary-500)] hover:shadow-md"
          >
            <div className="mb-4 text-4xl">{category.icon}</div>
            <h3 className="font-semibold text-[var(--neutral-900)] group-hover:text-[var(--primary-500)]">
              {category.name}
            </h3>
            <p className="text-sm text-[var(--neutral-600)]">
              {category.topics} chủ đề
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
