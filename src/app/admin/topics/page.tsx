"use client";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { TopicModal } from "@/components/admin/topics/TopicModal";
import { topicService, Topic, CreateTopicRequest } from "@/services/admin/topic.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminTopicsContent() {
  const router = useRouter();
  // Filters
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;

  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sort, setSort] = useState<string>("-id");

  const fetchTopics = async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await topicService.getAll(pageIndex, 10, debouncedSearch, sort);
      setData(response.metaData.topics);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
       // ... error handling
      console.error("Failed to fetch topics:", error);
      toast.error("Không thể tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(1);
  }, [debouncedSearch, sort]);

  useEffect(() => {
    fetchTopics(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchTopics(newPage);
  };

  const handleCreate = () => {
    setEditingTopic(null);
    setIsModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) return;
    
    try {
      await topicService.delete(id);
      toast.success("Xóa chủ đề thành công");
      fetchTopics(page);
    } catch (error) {
      console.error("Failed to delete topic:", error);
      toast.error("Không thể xóa chủ đề");
    }
  };

  const handleModalSubmit = async (formData: CreateTopicRequest) => {
    setIsSubmitting(true);
    try {
      if (editingTopic) {
        await topicService.update(editingTopic.id, formData);
        toast.success("Cập nhật chủ đề thành công");
      } else {
        await topicService.create(formData);
        toast.success("Thêm chủ đề thành công");
      }
      setIsModalOpen(false);
      fetchTopics(page);
    } catch (error) {
      console.error("Failed to save topic:", error);
      toast.error(editingTopic ? "Không thể cập nhật chủ đề" : "Không thể thêm chủ đề");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Topic>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Tên chủ đề",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "totalWords",
      header: "Số từ",
      cell: ({ row }) => <div className="text-center">{row.getValue("totalWords")}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const topic = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(topic); }}>
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(topic.id); }}>
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
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý Chủ đề</h1>
            <p className="text-neutral-600 mt-1">Quản lý các chủ đề bài học</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary text-white">
            <Plus className="w-5 h-5 mr-2" />
            Thêm chủ đề
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
               <Input
                 placeholder="Tìm kiếm chủ đề..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
               />
            </div>

            <div className="flex items-center gap-2">
                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[200px] bg-gray-50 border-gray-200">
                         <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-id">Mới nhất</SelectItem>
                        <SelectItem value="+id">Cũ nhất</SelectItem>
                        <SelectItem value="+name">Tên (A-Z)</SelectItem>
                        <SelectItem value="-name">Tên (Z-A)</SelectItem>
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
          onRowClick={(row) => router.push(`/admin/topics/${row.id}`)}
        />
      </div>

      <TopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalSubmit}
        initialData={editingTopic}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default function AdminTopicsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminTopicsContent />
    </Suspense>
  );
}
