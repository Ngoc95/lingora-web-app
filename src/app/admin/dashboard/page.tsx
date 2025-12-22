export default function AdminDashboardPage() {
  const stats = [
    { label: "Tổng người dùng", value: "1,234", change: "+12%", icon: "👥" },
    { label: "Đang hoạt động", value: "456", change: "+5%", icon: "🟢" },
    { label: "Bài học hoàn thành", value: "8,901", change: "+23%", icon: "📖" },
    { label: "Đề thi đã làm", value: "2,345", change: "+18%", icon: "📝" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
          Dashboard
        </h1>
        <p className="text-[var(--neutral-600)]">
          Tổng quan hệ thống Lingora
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[var(--neutral-900)]">
              {stat.value}
            </p>
            <p className="text-sm text-[var(--neutral-600)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--neutral-900)]">
            Hoạt động gần đây
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-[var(--neutral-50)] p-3"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--neutral-900)]">
                    Người dùng #{i} đã hoàn thành bài học
                  </p>
                  <p className="text-xs text-[var(--neutral-600)]">
                    {i} phút trước
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[var(--neutral-900)]">
            Thống kê học tập
          </h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-[var(--neutral-50)]">
            <p className="text-[var(--neutral-600)]">
              Biểu đồ thống kê sẽ hiển thị ở đây
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
