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
import { WordModal } from "@/components/admin/words/WordModal";
import { vocabularyService } from "@/services/vocabulary.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";

interface Word {
  id: number;
  word: string;
  meaning: string;
  vnMeaning?: string; 
  type: string;
  cefrLevel: string;
  topic?: { id: number; name: string };
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  phonetic?: string;
}

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CEFR_LEVELS, WORD_TYPES } from "@/constants/word-enums";

function AdminWordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId") ? Number(searchParams.get("topicId")) : undefined;

  const [data, setData] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sort, setSort] = useState<string>("-id");
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  const fetchWords = async (pageIndex: number) => {
    setLoading(true);
    try {
      // topicId is from URL param if present
      const response = await vocabularyService.admin.getAll(pageIndex, 10, debouncedSearch, sort, level, type);
      setData(response.metaData.words);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      console.error("Failed to fetch words:", error);
      toast.error("Không thể tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords(1);
  }, [debouncedSearch, sort, level, type]);

  const handlePageChange = (newPage: number) => {
    fetchWords(newPage);
  };

  const handleCreate = () => {
    setEditingWord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ này?")) return;
    
    try {
      await vocabularyService.admin.delete(id);
      toast.success("Xóa từ thành công");
      fetchWords(page);
    } catch (error) {
      console.error("Failed to delete word:", error);
      toast.error("Không thể xóa từ");
    }
  };

  const handleModalSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingWord) {
        await vocabularyService.admin.update(editingWord.id, formData);
        toast.success("Cập nhật từ thành công");
      } else {
        await vocabularyService.admin.create(formData);
        toast.success("Thêm từ thành công");
      }
      setIsModalOpen(false);
      fetchWords(page);
    } catch (error) {
      console.error("Failed to save word:", error);
      toast.error(editingWord ? "Không thể cập nhật từ" : "Không thể thêm từ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Word>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "word",
      header: "Từ vựng",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-primary">{row.getValue("word")}</div>
          {row.original.phonetic && <div className="text-xs text-gray-500">{row.original.phonetic}</div>}
        </div>
      ),
    },
    {
      accessorKey: "meaning",
      header: "Nghĩa",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="truncate font-medium">{row.getValue("meaning")}</div>
          {row.original.vnMeaning && (
            <div className="truncate text-xs text-gray-500">{row.original.vnMeaning}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Loại từ",
      cell: ({ row }) => <div className="italic text-gray-600">{row.getValue("type")}</div>,
    },
    {
      accessorKey: "cefrLevel",
      header: "Level",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          {row.getValue("cefrLevel")}
        </span>
      ),
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const word = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(word); }}>
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(word.id); }}>
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
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý Từ vựng</h1>
            <p className="text-neutral-600 mt-1">Danh sách từ vựng trong hệ thống</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary text-white">
            <Plus className="w-5 h-5 mr-2" />
            Thêm từ mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
               <Input
                 placeholder="Tìm kiếm từ vựng..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
               />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                 <Select value={level || "ALL"} onValueChange={(v) => setLevel(v === "ALL" ? undefined : v)}>
                    <SelectTrigger className="w-[150px] bg-gray-50 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span>Level: {level || "Tất cả"}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả trình độ</SelectItem>
                        {CEFR_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={type || "ALL"} onValueChange={(v) => setType(v === "ALL" ? undefined : v)}>
                    <SelectTrigger className="w-[150px] bg-gray-50 border-gray-200">
                         <div className="flex items-center gap-2">
                            <span>Loại: {type ? WORD_TYPES.find(t => t.value === type)?.label : "Tất cả"}</span>
                          </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tất cả loại từ</SelectItem>
                        {WORD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                </Select>

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
                        <SelectItem value="+word">Từ (A-Z)</SelectItem>
                        <SelectItem value="-word">Từ (Z-A)</SelectItem>
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

      <WordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalSubmit}
        initialData={editingWord}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default function AdminWordsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminWordsContent />
    </Suspense>
  );
}
