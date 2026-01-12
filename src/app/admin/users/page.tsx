"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Ban, Lock, Unlock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { UserModal } from "@/components/admin/users/UserModal";
import { UserRestrictionDialog } from "@/components/admin/users/UserRestrictionDialog";
import { userService } from "@/services/user.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { UserStatus, USER_SORT_OPTIONS } from "@/constants/user-enums";

interface User {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: string }[];
  status: string;
  proficiency: string;
  avatar?: string;
  banReason?: string;
  suspendedUntil?: string;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string>(USER_SORT_OPTIONS[0].value);

  // Restriction Dialog State
  const [restrictionType, setRestrictionType] = useState<"ban" | "suspend" | null>(null);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [isRestrictionOpen, setIsRestrictionOpen] = useState(false);

  const fetchUsers = async (pageIndex: number) => {
    setLoading(true);
    try {
      // Pass filters to service
      const response = await userService.admin.getAll(pageIndex, 10, debouncedSearch, undefined, status, sort);
      setData(response.metaData.users);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [debouncedSearch, status, sort]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    
    try {
      await userService.admin.delete(id);
      toast.success("Xóa người dùng thành công");
      fetchUsers(page);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Không thể xóa người dùng");
    }
  };

  const handleModalSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userService.admin.updateUser(editingUser.id, formData);
        toast.success("Cập nhật người dùng thành công");
      } else {
        await userService.admin.createUser(formData);
        toast.success("Thêm người dùng thành công");
      }
      setIsModalOpen(false);
      fetchUsers(page);
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error(editingUser ? "Không thể cập nhật người dùng" : "Không thể thêm người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRestrictionDialog = (user: User, type: "ban" | "suspend") => {
    setActionUser(user);
    setRestrictionType(type);
    setIsRestrictionOpen(true);
  };

  const handleRestrictionConfirm = async (reason: string, suspendedUntil?: string) => {
    if (!actionUser || !restrictionType) return;
    try {
      if (restrictionType === "ban") {
        await userService.admin.ban(actionUser.id, reason);
        toast.success(`Đã khóa tài khoản ${actionUser.username}`);
      } else {
        if (suspendedUntil) {
           await userService.admin.suspend(actionUser.id, reason, suspendedUntil);
           toast.success(`Đã tạm ngưng tài khoản ${actionUser.username}`);
        }
      }
      fetchUsers(page);
    } catch (error) {
       console.error("Restriction failed", error);
       toast.error("Thao tác thất bại");
    }
  };

  const handleUnlock = async (user: User) => {
    if (!confirm(`Bạn có chắc chắn muốn mở khóa cho ${user.username}?`)) return;
    try {
      await userService.admin.unlock(user.id);
      toast.success(`Đã mở khóa tài khoản ${user.username}`);
      fetchUsers(page);
    } catch (error) {
      console.error("Unlock failed", error);
      toast.error("Mở khóa thất bại");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "username",
      header: "Tên đăng nhập",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
               {row.original.avatar ? <img src={row.original.avatar} alt="" className="w-full h-full object-cover" /> : (row.getValue("username") as string)[0].toUpperCase()}
            </div>
            <div className="font-medium">{row.getValue("username")}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "roles",
      header: "Vai trò",
      cell: ({ row }) => {
        const roles = row.original.roles;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
                <span key={role.id} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {role.name}
                </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const user = row.original;
        const status = user.status;
        let colorClass = "bg-green-50 text-green-700 ring-green-600/20";
        let label = status;

        if (status === "banned" || status === "BANNED") {
            colorClass = "bg-red-50 text-red-700 ring-red-600/20";
            label = "Bị khóa";
        }
        if (status === "suspended" || status === "SUSPENDED") {
            colorClass = "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
            label = "Tạm ngưng";
        }
        
        return (
          <div className="flex flex-col gap-1">
             <span className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
                {label}
             </span>
             {status === "SUSPENDED" && user.suspendedUntil && (
                 <span className="text-[10px] text-gray-500">
                    Đến: {format(new Date(user.suspendedUntil), "dd/MM/yyyy")}
                 </span>
             )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isRestricted = user.status === "BANNED" || user.status === "SUSPENDED" || user.status === "banned" || user.status === "suspended";

        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Sửa">
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            
            {isRestricted ? (
               <Button variant="ghost" size="icon" onClick={() => handleUnlock(user)} title="Mở khóa">
                 <Unlock className="h-4 w-4 text-green-500" />
               </Button>
            ) : (
               <>
                 <Button variant="ghost" size="icon" onClick={() => openRestrictionDialog(user, "suspend")} title="Tạm ngưng">
                   <Clock className="h-4 w-4 text-yellow-600" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => openRestrictionDialog(user, "ban")} title="Khóa vĩnh viễn">
                   <Ban className="h-4 w-4 text-red-500" />
                 </Button>
               </>
            )}

            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} title="Xóa">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý Người dùng</h1>
            <p className="text-neutral-600 mt-1">Danh sách người dùng và phân quyền</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary text-white">
            <Plus className="w-5 h-5 mr-2" />
            Thêm người dùng
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
               <Input
                 placeholder="Tìm kiếm theo username, email..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
               />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select value={status || "ALL"} onValueChange={(v) => setStatus(v === "ALL" ? undefined : v)}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Trạng thái:</span>
                            <SelectValue placeholder="Tất cả" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả</SelectItem>
                        {Object.values(UserStatus).map((s) => (
                           <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sort || USER_SORT_OPTIONS[0].value} onValueChange={(v) => setSort(v)}>
                    <SelectTrigger className="w-[200px] bg-gray-50 border-gray-200">
                         <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {USER_SORT_OPTIONS.map((opt) => (
                           <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
        <DataTable
          columns={columns}
          data={data}
          pageCount={totalPages}
          pageIndex={page}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalSubmit}
        initialData={editingUser}
        isLoading={isSubmitting}
      />
      
      {actionUser && restrictionType && (
          <UserRestrictionDialog
              isOpen={isRestrictionOpen}
              onClose={() => setIsRestrictionOpen(false)}
              onConfirm={handleRestrictionConfirm}
              type={restrictionType}
              userName={actionUser.username}
          />
      )}
    </div>
  );
}
