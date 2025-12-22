"use client";

import { useState } from "react";
import { Search, Filter, UserPlus } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  status: "ACTIVE" | "BANNED" | "PENDING";
  roles: string[];
  createdAt: string;
}

const MOCK_USERS: User[] = [
  { id: 1, username: "johndoe", email: "john@email.com", status: "ACTIVE", roles: ["LEARNER"], createdAt: "2024-12-01" },
  { id: 2, username: "janedoe", email: "jane@email.com", status: "BANNED", roles: ["LEARNER"], createdAt: "2024-12-02" },
  { id: 3, username: "admin_user", email: "admin@email.com", status: "ACTIVE", roles: ["ADMIN"], createdAt: "2024-11-15" },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700";
      case "BANNED": return "bg-red-100 text-red-700";
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
            <p className="text-neutral-600 mt-1">Manage all users in the system</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100/50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-100/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{user.roles.join(", ")}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors">
                        Edit
                      </button>
                      <button className={`px-3 py-1 text-sm rounded transition-colors ${
                        user.status === "BANNED" 
                          ? "text-green-600 hover:bg-green-50" 
                          : "text-red-600 hover:bg-red-50"
                      }`}>
                        {user.status === "BANNED" ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing {filteredUsers.length} of {MOCK_USERS.length} users
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-neutral-100 rounded hover:bg-neutral-100/50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded">1</button>
            <button className="px-3 py-1 border border-neutral-100 rounded hover:bg-neutral-100/50 transition-colors">
              2
            </button>
            <button className="px-3 py-1 border border-neutral-100 rounded hover:bg-neutral-100/50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
