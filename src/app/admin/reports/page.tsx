"use client";

interface Report {
  id: number;
  targetType: "POST" | "COMMENT" | "STUDYSET";
  targetId: number;
  reason: string;
  reporter: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
}

const MOCK_REPORTS: Report[] = [
  { id: 1, targetType: "POST", targetId: 123, reason: "Inappropriate content", reporter: "user123", status: "PENDING", createdAt: "2024-12-20" },
  { id: 2, targetType: "COMMENT", targetId: 456, reason: "Spam", reporter: "user456", status: "RESOLVED", createdAt: "2024-12-19" },
];

export default function AdminReportsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "RESOLVED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reports Management</h1>
        <p className="text-neutral-600 mt-1">Review and moderate reported content</p>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100/50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Target ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MOCK_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-100/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-900">{report.id}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                      {report.targetType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{report.targetId}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{report.reason}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">@{report.reporter}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors">
                        View
                      </button>
                      {report.status === "PENDING" && (
                        <>
                          <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors">
                            Resolve
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
