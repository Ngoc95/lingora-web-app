"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { CategoryModal } from "@/components/admin/categories/CategoryModal";
import { categoryService, Category, CreateCategoryRequest } from "@/services/admin/category.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";

import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await categoryService.getAll(pageIndex, 10, debouncedSearch);
      setData(response.metaData.categories);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, [debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    fetchCategories(newPage);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    
    try {
      await categoryService.delete(id);
      toast.success("Xóa danh mục thành công");
      fetchCategories(page);
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Không thể xóa danh mục");
    }
  };

  const handleModalSubmit = async (formData: CreateCategoryRequest) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryService.create(formData);
        toast.success("Thêm danh mục thành công");
      }
      setIsModalOpen(false);
      fetchCategories(page);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error(editingCategory ? "Không thể cập nhật danh mục" : "Không thể thêm danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Tên danh mục",
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
      accessorKey: "totalTopics",
      header: "Số chủ đề",
      cell: ({ row }) => <div className="text-center">{row.getValue("totalTopics")}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(category); }}>
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý Danh mục</h1>
          <p className="text-neutral-600 mt-1">Quản lý danh mục từ vựng trong hệ thống</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary text-white">
          <Plus className="w-5 h-5 mr-2" />
          Thêm danh mục
        </Button>
      </div>

       <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-sm mb-6">
          <div className="relative flex-1 min-w-[200px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
             <Input
               placeholder="Tìm kiếm danh mục..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
             />
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
          onRowClick={(row) => router.push(`/admin/categories/${row.id}`)}
        />
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalSubmit}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
