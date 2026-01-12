"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateExamRequest } from "@/services/admin/exam.service";

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: UpdateExamRequest) => void;
  initialData?: any; // Using any for flexibility or specific type
  isLoading: boolean;
}

export function ExamModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isLoading,
}: ExamModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UpdateExamRequest>();
  const isPublished = watch("isPublished"); // Watch for checkbox control

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("title", initialData.title);
        setValue("code", initialData.code || "");
        setValue("isPublished", initialData.isPublished);
        setValue("thumbnailUrl", initialData.thumbnailUrl || "");
        setValue("description", initialData.description || "");
      } else {
        reset({ title: "", code: "", isPublished: false });
      }
    }
  }, [isOpen, initialData, setValue, reset]);

  const onSubmit = (data: UpdateExamRequest) => {
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa đề thi" : "Thêm đề thi mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input {...register("title", { required: "Bắt buộc" })} placeholder="Tiêu đề đề thi" />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Mã đề</Label>
            <Input {...register("code")} placeholder="Mã đề (VD: TEST01)" />
          </div>

          <div className="space-y-2 flex items-center space-x-2 pt-2">
             <Checkbox 
                id="isPublished"
                checked={isPublished}
                onCheckedChange={(checked) => setValue("isPublished", checked as boolean)}
             />
             <Label htmlFor="isPublished" className="font-normal cursor-pointer">
                Công khai (Published)
             </Label>
          </div>

          <div className="space-y-2">
             <Label>Thumbnail URL</Label>
             <Input {...register("thumbnailUrl")} placeholder="https://..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary">
              {isLoading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm mới")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
