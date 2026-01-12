"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { topicService, Topic } from "@/services/admin/topic.service";
import { Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming hook exists, or implements simple debounce

export function AddExistingTopicModal({
  isOpen,
  onClose,
  onConfirm,
  currentCategoryId
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (topic: Topic) => void;
  currentCategoryId: number;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTopics = async (pageIndex: number) => {
    setLoading(true);
    try {
      // hasCategory = false
      const response = await topicService.getAll(pageIndex, 10, debouncedSearch, undefined, false);
      setTopics(response.metaData.topics);
      setTotalPages(response.metaData.totalPages);
      setPage(response.metaData.currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
        setPage(1);
      fetchTopics(1);
    }
  }, [isOpen, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
         fetchTopics(newPage);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm chủ đề có sẵn (Chưa có danh mục)</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 my-2">
            <Input 
                placeholder="Tìm kiếm chủ đề..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? <div className="text-center py-4">Đang tải...</div> : (
                topics.length === 0 ? <div className="text-center py-4 text-gray-500">Không tìm thấy chủ đề nào chưa có danh mục</div> :
                topics.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-gray-500">{t.description}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => onConfirm(t)}>
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
