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
import { WordModal } from "@/components/admin/words/WordModal";
import { AddExistingWordModal } from "@/components/admin/words/AddExistingWordModal";
import { topicService, Topic } from "@/services/admin/topic.service";
import { vocabularyService, Word } from "@/services/vocabulary.service";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { WORD_TYPES, CEFR_LEVELS } from "@/constants/word-enums";


export default function AdminTopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: topicIdStr } = use(params);
  const topicId = Number(topicIdStr);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  // Sort state
  const [sort, setSort] = useState<string>("-id");

  const fetchData = async (pageIndex: number) => {
    setLoading(true);
    try {
      // Single call to get Topic + Words
      // GET /topics/{id}/words
      const response = await vocabularyService.admin.getTopicWords(topicId, pageIndex, 10, debouncedSearch, sort, level, type);
      
      // ... same logic
      if (response && response.metaData) {
         const data: any = response.metaData;
         setTopic(data.topic);
         setWords(data.words || []);
         setTotalPages(data.totalPages || 1);
         setPage(data.currentPage || 1);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Không thể tải thông tin chủ đề");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [topicId, debouncedSearch, sort, level, type]);

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleCreateNew = () => {
    setEditingWord(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ này khỏi chủ đề?")) return;
    try {
      await vocabularyService.admin.delete(id);
      toast.success("Xóa từ thành công");
      // Refresh
      fetchData(page);
    } catch (error) {
       toast.error("Không thể xóa từ");
    }
  };

  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      formData.topicId = topicId;
      if (editingWord) {
        await vocabularyService.admin.update(editingWord.id, formData);
        toast.success("Cập nhật từ thành công");
      } else {
        await vocabularyService.admin.create(formData);
        toast.success("Thêm từ mới thành công");
      }
      setIsCreateModalOpen(false);
      fetchData(page);
    } catch (error: any) {
      toast.error(error.message || "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExisting = async (word: Word) => {
    setIsSubmitting(true);
    try {
      // Update word to be in this topic, sending full object to prevent data loss
      await vocabularyService.admin.update(word.id, { ...word, topicId } as any);
      toast.success("Đã thêm từ vào chủ đề");
      setIsAddExistingModalOpen(false);
      fetchData(page);
    } catch (error) {
      toast.error("Không thể thêm từ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Word>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <div className="w-[50px]">#{row.getValue("id")}</div> },
    { 
        accessorKey: "word", 
        header: "Từ vựng", 
        cell: ({ row }) => (
            <div>
              <div className="font-bold text-primary">{row.getValue("word")}</div>
              <div className="text-xs text-gray-500">{row.original.phonetic || ""}</div>
            </div>
        ) 
    },
    { 
        accessorKey: "meaning", 
        header: "Nghĩa", 
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.getValue("meaning")}>
                {row.getValue("meaning")}
                {row.original.vnMeaning && <div className="text-xs text-gray-400">{row.original.vnMeaning}</div>}
            </div>
        )
    },
    { accessorKey: "type", header: "Loại từ", cell: ({ row }) => <div className="italic text-gray-600">{row.getValue("type")}</div> },
    { 
        accessorKey: "cefrLevel", 
        header: "Level", 
        cell: ({ row }) => (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              {row.getValue("cefrLevel")}
            </span>
        ) 
    },
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
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại {topic?.category?.name ? `(${topic.category.name})` : ""}
        </Button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{topic?.name || "Chi tiết chủ đề"}</h1>
            <p className="text-neutral-600 mt-1">{topic?.description}</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setIsAddExistingModalOpen(true)}>
                Thêm có sẵn
             </Button>
             <Button onClick={handleCreateNew} className="bg-primary text-white">
               <Plus className="w-5 h-5 mr-2" /> Tạo từ mới
             </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
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
                    <SelectTrigger className="w-[150px] bg-gray-50 border-gray-200">
                         <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            <SelectValue placeholder="Sắp xếp" />
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
          data={words}
          pageCount={totalPages}
          pageIndex={page}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      </div>
      
      {/* ... Modals ... */}

      <WordModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateSubmit}
        initialData={editingWord}
        isLoading={isSubmitting}
        defaultTopicId={topicId}
      />

      <AddExistingWordModal
        isOpen={isAddExistingModalOpen}
        onClose={() => setIsAddExistingModalOpen(false)}
        onConfirm={handleAddExisting}
        currentTopicId={topicId}
      />
    </div>
  );
}
