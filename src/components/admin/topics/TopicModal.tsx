"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topic, CreateTopicRequest } from "@/services/admin/topic.service";
import { categoryService, Category } from "@/services/admin/category.service";

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateTopicRequest) => void;
  initialData?: Topic | null;
  isLoading: boolean;
  defaultCategoryId?: number;
}

export function TopicModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isLoading,
  defaultCategoryId
}: TopicModalProps) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CreateTopicRequest>();
  

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("description", initialData.description);
        setValue("image", initialData.image);
        if (initialData.category) {
          setValue("categoryId", initialData.category.id);
        }
      } else {
        reset({
          name: "",
          description: "",
          image: "",
          categoryId: defaultCategoryId
        });
      }
    }
  }, [isOpen, initialData, setValue, reset, defaultCategoryId]);

  const onSubmit = (data: CreateTopicRequest) => {
     // Ensure categoryId is set from default if not in form
     if (defaultCategoryId) {
         data.categoryId = defaultCategoryId;
     }
     onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa chủ đề" : "Thêm chủ đề mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tên chủ đề <span className="text-red-500">*</span></Label>
            <Input {...register("name", { required: "Vui lòng nhập tên chủ đề" })} placeholder="Nhập tên chủ đề" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea {...register("description")} placeholder="Mô tả ngắn về chủ đề..." />
          </div>
          
          <div className="space-y-2">
            <Label>Hình ảnh (URL)</Label>
            <Input {...register("image")} placeholder="https://example.com/image.jpg" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-white">
              {isLoading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm mới")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
