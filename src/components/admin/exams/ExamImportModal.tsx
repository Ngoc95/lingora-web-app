"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { examAdminService } from "@/services/admin/exam.service";
import { toast } from "react-hot-toast";
import { Upload } from "lucide-react";

interface ExamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExamImportModal({ isOpen, onClose, onSuccess }: ExamImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file JSON");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const parsedData = JSON.parse(jsonContent);
        
        await examAdminService.importExam(parsedData);
        
        toast.success("Nhập đề thi thành công");
        onSuccess();
        onClose();
        setFile(null);
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Lỗi khi nhập đề thi. Vui lòng kiểm tra định dạng file.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nhập đề thi từ file JSON</DialogTitle>
        </DialogHeader>
        
        <div className="grid w-full max-w-sm items-center gap-1.5 py-4">
          <Label htmlFor="exam-json">File đề thi (.json)</Label>
          <div className="flex items-center gap-2">
            <Input id="exam-json" type="file" accept=".json" onChange={handleFileChange} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Chọn file JSON chứa cấu trúc đề thi hợp lệ.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading} className="bg-primary">
             {isLoading ? "Đang xử lý..." : (
                 <>
                   <Upload className="w-4 h-4 mr-2" /> Nhập
                 </>
             )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
