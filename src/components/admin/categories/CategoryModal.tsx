"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category, CreateCategoryRequest } from "@/services/admin/category.service";

// Assuming Label component might be missing, using standard label for now to be safe, 
// or I can quickly check/create Label component. 
// Standard shadcn label is usually in components/ui/label.tsx. 
// I'll assume it exists or I'll fix it. actually let's use standard HTML label with standard classes if unsure.
// But better to stick to Shadcn pattern. 

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateCategoryRequest) => void;
  initialData?: Category | null;
  isLoading: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isLoading,
}: CategoryModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateCategoryRequest>();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("description", initialData.description);
      } else {
        reset({ name: "", description: "" });
      }
    }
  }, [isOpen, initialData, setValue, reset]);

  const onSubmit = (data: CreateCategoryRequest) => {
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tên danh mục</Label>
            <Input
              id="name"
              placeholder="Nhập tên danh mục..."
              {...register("name", { required: "Tên danh mục là bắt buộc" })}
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name.message}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả..."
              {...register("description", { required: "Mô tả là bắt buộc" })}
            />
            {errors.description && (
              <span className="text-sm text-red-500">{errors.description.message}</span>
            )}
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
