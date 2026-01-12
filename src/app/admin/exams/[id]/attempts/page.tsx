"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { examAdminService, ExamAttempt } from "@/services/admin/exam.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AdminExamAttemptsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const examId = Number(id);

  const [data, setData] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttempts = async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await examAdminService.adminListAttempts({ examId: examId, page: pageIndex, limit: 10 });
      setData(response.metaData.attempts || []);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      console.error("Failed to fetch attempts:", error);
      toast.error("Không thể tải danh sách bài làm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) {
       fetchAttempts(1);
    }
  }, [examId]);

  const handlePageChange = (newPage: number) => {
    fetchAttempts(newPage);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const columns: ColumnDef<ExamAttempt>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div>,
    },
    {
      id: "user",
      header: "Người dùng",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
               {row.original.user?.avatar ? <img src={row.original.user.avatar} alt="" className="w-full h-full object-cover" /> : (row.original.user?.username?.[0]?.toUpperCase() || "?")}
            </div>
            <div>
                <div className="font-medium">{row.original.user?.username || "Unknown User"}</div>
                <div className="text-xs text-gray-500">{row.original.user?.email || "No Email"}</div>
            </div>
        </div>
      ),
    },
    {
      accessorKey: "score",
      header: "Điểm số",
      cell: ({ row }) => <div className="font-bold text-primary">{row.getValue("score")}</div>,
    },
    {
      accessorKey: "duration",
      header: "Thời gian làm bài",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-gray-600">
           <Clock className="w-3 h-3" />
           {formatDuration(row.getValue("duration"))}
        </div>
      ),
    },
    {
      accessorKey: "completedAt",
      header: "Thời gian nộp",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-gray-600">
           <Calendar className="w-3 h-3" />
           {format(new Date(row.getValue("completedAt")), "dd/MM/yyyy HH:mm")}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách đề thi
        </Button>
        <div>
           <h1 className="text-2xl font-bold text-neutral-900">Danh sách bài làm</h1>
           <p className="text-neutral-600 mt-1">Lịch sử làm bài của người dùng cho đề thi #{examId}</p>
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
    </div>
  );
}
