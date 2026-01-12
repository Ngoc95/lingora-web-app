"use client";

import { useEffect, useState } from "react";
import { withdrawalService, WithdrawalRequest } from "@/services/admin/withdrawal.service";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, ArrowUpDown, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { ApproveWithdrawalDialog, RejectWithdrawalDialog, CompleteWithdrawalDialog, FailWithdrawalDialog } from "@/components/admin/withdrawals/WithdrawalDialogs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminWithdrawalsPage() {
  const [data, setData] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string>("-createdAt");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isFailOpen, setIsFailOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWithdrawals = async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await withdrawalService.getAll(pageIndex, 10, statusFilter, sort, debouncedSearch);
      setData(response.metaData.withdrawals);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      toast.error("Không thể tải danh sách rút tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(1);
  }, [statusFilter, sort, debouncedSearch]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await withdrawalService.approve(selectedRequest.id);
      toast.success("Đã phê duyệt yêu cầu (Đang xử lý)");
      setIsApproveOpen(false);
      fetchWithdrawals(page);
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await withdrawalService.reject(selectedRequest.id, reason);
      toast.success("Đã từ chối yêu cầu");
      setIsRejectOpen(false);
      fetchWithdrawals(page);
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async (txRef: string) => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await withdrawalService.complete(selectedRequest.id, txRef);
      toast.success("Đã hoàn thành yêu cầu");
      setIsCompleteOpen(false);
      fetchWithdrawals(page);
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFail = async (reason: string) => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await withdrawalService.fail(selectedRequest.id, reason);
      toast.success("Đã báo cáo thất bại");
      setIsFailOpen(false);
      fetchWithdrawals(page);
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const openApprove = (req: WithdrawalRequest) => { setSelectedRequest(req); setIsApproveOpen(true); };
  const openReject = (req: WithdrawalRequest) => { setSelectedRequest(req); setIsRejectOpen(true); };
  const openComplete = (req: WithdrawalRequest) => { setSelectedRequest(req); setIsCompleteOpen(true); };
  const openFail = (req: WithdrawalRequest) => { setSelectedRequest(req); setIsFailOpen(true); };
  const openDetail = (req: WithdrawalRequest) => { setSelectedRequest(req); setIsDetailOpen(true); };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case "PENDING": return <Badge variant="secondary">Chờ duyệt</Badge>;
          case "APPROVED": return <Badge className="bg-blue-500 hover:bg-blue-600">Đã duyệt</Badge>; // If exists
          case "PROCESSING": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đang xử lý</Badge>;
          case "COMPLETED": return <Badge className="bg-green-500 hover:bg-green-600">Hoàn thành</Badge>;
          case "REJECTED": return <Badge variant="destructive">Đã từ chối</Badge>;
          case "FAILED": return <Badge variant="destructive">Thất bại</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  const columns: ColumnDef<WithdrawalRequest>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div> },
    { 
        id: "user", header: "Người dùng", 
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.user?.username || `User #${row.original.userId}`}</div>
                <div className="text-xs text-gray-500">{row.original.user?.email}</div>
            </div>
        ) 
    },
    { 
        accessorKey: "amount", header: "Số tiền", 
        cell: ({ row }) => <div className="font-bold text-primary">{formatCurrency(row.getValue("amount"))}</div> 
    },
    { 
        accessorKey: "status", header: "Trạng thái", 
        cell: ({ row }) => getStatusBadge(row.getValue("status"))
    },
    { accessorKey: "createdAt", header: "Ngày tạo", cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleDateString('vi-VN')}</div> },
    {
      id: "actions",
      cell: ({ row }) => {
        const req = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => openDetail(req)} title="Chi tiết">
                <Eye className="w-4 h-4 text-gray-500" />
            </Button>
            {req.status === "PENDING" && (
                <>
                    <Button variant="ghost" size="icon" onClick={() => openApprove(req)} title="Phê duyệt">
                        <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openReject(req)} title="Từ chối">
                        <X className="w-4 h-4 text-red-500" />
                    </Button>
                </>
            )}
            {(req.status === "PROCESSING" || req.status === "APPROVED") && (
                <>
                    <Button variant="ghost" size="icon" onClick={() => openComplete(req)} title="Hoàn thành">
                        <CheckCircle className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openFail(req)} title="Báo lỗi">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    </Button>
                </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
       <div className="mb-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Quản lý Rút tiền</h1>
                <p className="text-neutral-600 mt-1">Danh sách yêu cầu rút tiền từ giáo viên/người dùng</p>
            </div>
       </div>
       {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-sm mb-6">
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm theo user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
             </div>

             <div className="flex flex-wrap items-center gap-2">
                <Select 
                    value={statusFilter || "ALL"} 
                    onValueChange={(v) => setStatusFilter(v === "ALL" ? undefined : v)}
                >
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                        <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                        <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                        <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                        <SelectItem value="FAILED">Thất bại</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[200px] bg-gray-50 border-gray-200">
                            <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            <SelectValue placeholder="Sắp xếp" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-createdAt">Mới nhất</SelectItem>
                        <SelectItem value="+createdAt">Cũ nhất</SelectItem>
                        <SelectItem value="+amount">Số tiền (Thấp - Cao)</SelectItem>
                        <SelectItem value="-amount">Số tiền (Cao - Thấp)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
       </div>

       <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <DataTable columns={columns} data={data} pageCount={totalPages} pageIndex={page} onPageChange={fetchWithdrawals} isLoading={loading} />
       </div>

       <ApproveWithdrawalDialog 
          isOpen={isApproveOpen} 
          onClose={() => setIsApproveOpen(false)} 
          onConfirm={handleApprove} 
          isLoading={isProcessing} 
       />

       <RejectWithdrawalDialog 
          isOpen={isRejectOpen} 
          onClose={() => setIsRejectOpen(false)} 
          onConfirm={handleReject} 
          isLoading={isProcessing} 
       />

       <CompleteWithdrawalDialog 
          isOpen={isCompleteOpen} 
          onClose={() => setIsCompleteOpen(false)} 
          onConfirm={handleComplete} 
          isLoading={isProcessing} 
       />

       <FailWithdrawalDialog 
          isOpen={isFailOpen} 
          onClose={() => setIsFailOpen(false)} 
          onConfirm={handleFail} 
          isLoading={isProcessing} 
       />

        {selectedRequest && (
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chi tiết yêu cầu #{selectedRequest.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500">Người yêu cầu</h4>
                                <p>{selectedRequest.user?.username}</p>
                                <p className="text-sm text-gray-500">{selectedRequest.user?.email}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500">Số tiền</h4>
                                <p className="text-primary font-bold text-lg">{formatCurrency(selectedRequest.amount)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500">Trạng thái</h4>
                                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm text-gray-500 mb-2">Thông tin ngân hàng</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-600">Ngân hàng:</span>
                                <span>{selectedRequest.bankName}</span>
                                <span className="text-gray-600">Số tài khoản:</span>
                                <span>{selectedRequest.bankAccount}</span>
                                <span className="text-gray-600">Chủ tài khoản:</span>
                                <span>{selectedRequest.accountHolder}</span>
                            </div>
                        </div>
                        {selectedRequest.reason && (
                             <div className="border-t pt-4">
                                <h4 className="font-semibold text-sm text-red-500 mb-1">Lý do từ chối / thất bại</h4>
                                <p className="text-sm bg-red-50 p-2 rounded text-red-700">{selectedRequest.reason}</p>
                             </div>
                        )}
                        <div className="text-xs text-gray-400 mt-4">
                            Ngày tạo: {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
