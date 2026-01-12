"use client";

import { useEffect, useState, use } from "react";
import { Plus, ArrowLeft, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/data-table";
import { TopicModal } from "@/components/admin/topics/TopicModal";
import { AddExistingTopicModal } from "@/components/admin/topics/AddExistingTopicModal";
import { categoryService, Category } from "@/services/admin/category.service";
import { topicService, Topic, CreateTopicRequest } from "@/services/admin/topic.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Unwrap params using use() hook as per Next.js 15/16 pattern if needed, or await.
  // Since the type signature says Promise, we should await it or use `use`.
  // For client components, params are often passed directly in older versions, 
  // but let's safely handle the promise.
  const { id: categoryIdStr } = use(params);
  const categoryId = Number(categoryIdStr);

  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  // Simple sort toggle or select. Let's use simple toggle for name for now, or match Lingora_FE params
  const [sort, setSort] = useState<string | undefined>("-id");

  const fetchData = async (pageIndex: number) => {
    setLoading(true);
    try {
      // Fetch Category Info (Assuming getById returns detail)
      const categoryRes = await categoryService.getById(categoryId);
      setCategory(categoryRes.metaData);

      // Fetch Nested Topics using STRICT endpoint
      // GET /categories/{id}/topics
      const topicRes = await topicService.getCategoryTopics(categoryId, pageIndex, 10, debouncedSearch, sort);
      
      // Handle response structure. If CategoryWithTopicsResponse contains topics list directly or in a nested property.
      // Based on typical Lingora_FE DTO: CategoryWithTopicsDto(category, topics)
      // So topicRes.metaData might have .topics
      // Or if it returns just the list in `data` (if generic list response).
      // Let's assume the service returns { category, topics, totalPages... } as defined in interface
      if (topicRes.metaData.topics) {
          setTopics(topicRes.metaData.topics);
          setTotalPages(topicRes.metaData.totalPages);
          setPage(topicRes.metaData.currentPage);
      } else {
          // Fallback if structure is different
           setTopics([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Không thể tải thông tin danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [categoryId, debouncedSearch, sort]);

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleCreateNew = () => {
    setEditingTopic(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chủ đề này khỏi danh mục?")) return;
    try {
      await topicService.delete(id);
      toast.success("Xóa chủ đề thành công");
      fetchData(page);
    } catch (error) {
      toast.error("Không thể xóa chủ đề");
    }
  };

  const handleCreateSubmit = async (formData: CreateTopicRequest) => {
    setIsSubmitting(true);
    try {
      formData.categoryId = categoryId;
      if (editingTopic) {
        await topicService.update(editingTopic.id, formData);
        toast.success("Cập nhật chủ đề thành công");
      } else {
        await topicService.create(formData);
        toast.success("Thêm chủ đề mới thành công");
      }
      setIsCreateModalOpen(false);
      fetchData(page);
    } catch (error: any) {
      toast.error(error.message || "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExisting = async (topic: Topic) => {
    setIsSubmitting(true);
    try {
      // Send full object with updated categoryId to prevent data loss (e.g. description being wiped if backend replaces)
      await topicService.update(topic.id, { ...topic, categoryId } as any);
      toast.success("Đã thêm chủ đề vào danh mục");
      setIsAddExistingModalOpen(false);
      fetchData(page);
    } catch (error) {
      toast.error("Không thể thêm chủ đề");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Topic>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div> },
    { accessorKey: "name", header: "Tên chủ đề", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    { accessorKey: "description", header: "Mô tả", cell: ({ row }) => <div className="truncate max-w-[300px]">{row.getValue("description")}</div> },
    { accessorKey: "totalWords", header: "Số từ", cell: ({ row }) => <div className="text-center">{row.getValue("totalWords")}</div> },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(row.original); }}>
            <Pencil className="h-4 w-4 text-blue-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(row.original.id); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
        </Button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{category?.name || "Chi tiết danh mục"}</h1>
            <p className="text-neutral-600 mt-1">{category?.description}</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setIsAddExistingModalOpen(true)}>
                Thêm có sẵn
             </Button>
             <Button onClick={handleCreateNew} className="bg-primary text-white">
               <Plus className="w-5 h-5 mr-2" /> Tạo chủ đề mới
             </Button>
          </div>
        </div>
        
        {/* Search & Filter Bar */}
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
                            <SelectValue placeholder="Sắp xếp" />
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
          data={topics}
          pageCount={totalPages}
          pageIndex={page}
          onPageChange={handlePageChange}
          isLoading={loading}
          onRowClick={(row) => router.push(`/admin/topics/${row.id}`)}
        />
      </div>
      
      {/* ... Modals ... */}

      <TopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateSubmit}
        initialData={editingTopic}
        isLoading={isSubmitting}
        defaultCategoryId={categoryId}
      />

      <AddExistingTopicModal
        isOpen={isAddExistingModalOpen}
        onClose={() => setIsAddExistingModalOpen(false)}
        onConfirm={handleAddExisting}
        currentCategoryId={categoryId}
      />
    </div>
  );
}
