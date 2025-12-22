"use client";

interface Withdrawal {
  id: number;
  username: string;
  amount: number;
  bankAccount: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: 1, username: "teacher_jane", amount: 500000, bankAccount: "1234****5678", status: "PENDING", createdAt: "2024-12-20" },
  { id: 2, username: "content_creator", amount: 300000, bankAccount: "9876****4321", status: "APPROVED", createdAt: "2024-12-18" },
];

export default function AdminWithdrawalsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Withdrawal Management</h1>
        <p className="text-neutral-600 mt-1">Manage user withdrawal requests</p>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100/50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Bank Account</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MOCK_WITHDRAWALS.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-neutral-100/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-900">{withdrawal.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">@{withdrawal.username}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                    {withdrawal.amount.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{withdrawal.bankAccount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{withdrawal.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {withdrawal.status === "PENDING" && (
                        <>
                          <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors">
                            Approve
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors">
                        View
                      </button>
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
