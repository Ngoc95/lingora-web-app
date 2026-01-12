"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vocabularyService, Word } from "@/services/vocabulary.service"; // Need generic word type
import { Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

export function AddExistingWordModal({
  isOpen,
  onClose,
  onConfirm,
  currentTopicId
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (word: Word) => void;
  currentTopicId: number;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Simplified debounce
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchWords = async (pageIndex: number) => {
    setLoading(true);
    try {
      // Use param hasTopic=false to find orphans
      // Call vocabularyService.admin.getAll
      const response = await vocabularyService.admin.getAll(pageIndex, 10, debouncedSearch, undefined, undefined, undefined, false);
      setWords(response.metaData.words);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
       // Ignore error or log
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchWords(1);
    }
  }, [isOpen, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
       fetchWords(newPage);
    }
  }

  const handleAdd = async (word: Word) => {
      // Pass full object to parent for update
      onConfirm(word);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm từ vựng có sẵn (Chưa có chủ đề)</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 my-2">
            <Input 
                placeholder="Tìm kiếm từ vựng..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? <div className="text-center py-4">Đang tải...</div> : (
                words.length === 0 ? <div className="text-center py-4 text-gray-500">Không tìm thấy từ nào chưa có chủ đề</div> :
                words.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                {w.word} 
                                <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 rounded text-gray-500">{w.type}</span>
                            </div>
                            <div className="text-sm text-gray-600 max-w-[400px] truncate">{w.meaning}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => handleAdd(w)}>
                            <Plus className="w-4 h-4" /> Thêm
                        </Button>
                    </div>
                ))
            )}
        </div>
        
        {/* Simple Pagination */}
        <div className="py-2 border-t mt-2">
            <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
            />
        </div>

      </DialogContent>
    </Dialog>
  );
}
