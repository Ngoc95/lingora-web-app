"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamModal } from "@/components/admin/exams/ExamModal";
import { ExamImportModal } from "@/components/admin/exams/ExamImportModal";
import { examAdminService, Exam, ExamAttempt } from "@/services/admin/exam.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function AdminExamsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý Đề thi</h1>
        </div>
        <p className="text-neutral-600 mt-1">Quản lý các đề thi và xem lịch sử làm bài</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <Tabs defaultValue="exams" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="exams">Danh sách đề thi</TabsTrigger>
              <TabsTrigger value="attempts">Lịch sử làm bài</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exams">
               <ExamsList />
            </TabsContent>
            
            <TabsContent value="attempts">
               <AttemptsList />
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}

function ExamsList() {
  const router = useRouter();
  const [data, setData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExams = async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await examAdminService.getAll(pageIndex);
      setData(response.metaData.exams);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(1); }, []);

  const handleCreate = () => { setEditingExam(null); setIsModalOpen(true); };
  const handleEdit = (exam: Exam) => { setEditingExam(exam); setIsModalOpen(true); };
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;
    try { await examAdminService.delete(id); toast.success("Xóa thành công"); fetchExams(page); } catch { toast.error("Lỗi xóa"); }
  };
  const handleModalSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingExam) await examAdminService.update(editingExam.id, formData);
      else await examAdminService.create(formData);
      toast.success(editingExam ? "Cập nhật thành công" : "Thêm mới thành công");
      setIsModalOpen(false); fetchExams(page);
    } catch { toast.error("Lỗi lưu dữ liệu"); } finally { setIsSubmitting(false); }
  };

  const columns: ColumnDef<Exam>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div> },
    { accessorKey: "title", header: "Tiêu đề", cell: ({ row }) => <div className="font-medium text-primary">{row.getValue("title")}</div> },
    { accessorKey: "code", header: "Mã đề" },
    { accessorKey: "examType", header: "Loại đề" },
    { 
       accessorKey: "isPublished", header: "Trạng thái", 
       cell: ({ row }) => row.getValue("isPublished") ? 
          <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">Công khai</span> : 
          <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs">Ẩn</span> 
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}><Pencil className="w-4 h-4 text-blue-500" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </div>
      )
    }
  ];

  return (
    <div>
        <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}><Upload className="w-4 h-4 mr-2" /> Nhập JSON</Button>
            <Button onClick={handleCreate} className="bg-primary text-white"><Plus className="w-4 h-4 mr-2" /> Thêm đề thi</Button>
        </div>
        <DataTable columns={columns} data={data} pageCount={totalPages} pageIndex={page} onPageChange={fetchExams} isLoading={loading} />
        <ExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleModalSubmit} initialData={editingExam} isLoading={isSubmitting} />
        <ExamImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => fetchExams(1)} />
    </div>
  );
}

function AttemptsList() {
    const router = useRouter();
    const [data, setData] = useState<ExamAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState(""); 
    
    // Add debounce manually or just use standard
    useEffect(() => {
      const timer = setTimeout(() => setSearch(searchTerm), 500);
      return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchAttempts = async (pageIndex: number) => {
        setLoading(true);
        try {
            // Using adminListAttempts for global history
            const response = await examAdminService.adminListAttempts({ 
                page: pageIndex, 
                limit: 10,
                search: search 
            });
            setData(response.metaData.attempts || []);
            setTotalPages(response.metaData.totalPages);
            setPage(response.metaData.currentPage);
        } catch {
            toast.error("Không thể tải lịch sử làm bài");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAttempts(1); }, [search]);

    const columns: ColumnDef<ExamAttempt>[] = [
         { accessorKey: "id", header: "ID", cell: ({ row }) => <div>#{row.getValue("id")}</div> },
         { 
             id: "user", header: "Người dùng", 
             cell: ({ row }) => (
                 <div>
                    <div className="font-medium">{row.original.user?.username || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{row.original.user?.email}</div>
                 </div>
             ) 
         },
         { 
             id: "exam", header: "Đề thi", 
             cell: ({ row }) => (
                 <div>
                    <div className="font-medium text-primary">{row.original.exam?.title || "Unknown Exam"}</div>
                    <div className="text-xs text-gray-500">{row.original.exam?.code}</div>
                 </div>
             ) 
         },
         { accessorKey: "overallScore", header: "Điểm", cell: ({ row }) => <div className="font-bold text-primary">{row.original.scoreSummary?.bands?.overall ?? row.original.scoreSummary?.overallScore ?? "-"}</div> },
         { accessorKey: "submittedAt", header: "Ngày nộp", cell: ({ row }) => <div>{row.original.submittedAt ? format(new Date(row.original.submittedAt as any), "dd/MM/yyyy HH:mm") : "-"}</div> },
         {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/exams/attempts/${row.original.id}`)}>
                    <Eye className="w-4 h-4 text-blue-500" />
                </Button>
            )
         }
    ];

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-2 max-w-sm border rounded-lg px-3 py-2 bg-white">
                <Search className="w-4 h-4 text-gray-500" />
                <input 
                    className="outline-none text-sm w-full" 
                    placeholder="Tìm kiếm người dùng hoặc đề thi..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <DataTable columns={columns} data={data} pageCount={totalPages} pageIndex={page} onPageChange={fetchAttempts} isLoading={loading} />
        </div>
    );
}
