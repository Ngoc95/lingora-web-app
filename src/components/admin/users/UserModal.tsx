"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { USER_ROLES, UserStatus, PROFICIENCY_LEVELS } from "@/constants/user-enums";

// Define interfaces locally or import
interface UserRole {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
  status: string;
  proficiency: string;
  banReason?: string;
  suspendedUntil?: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password?: string; // Optional for update, required for create typically but here we use same type
  roleIds: number[];
  proficiency: string;
  status?: string;
  banReason?: string;
  suspendedUntil?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateUserRequest) => void;
  initialData?: User | null;
  isLoading: boolean;
}

const STATUSES = [
  { value: UserStatus.ACTIVE, label: "Hoạt động (Active)" },
  { value: UserStatus.INACTIVE, label: "Không hoạt động (Inactive)" },
  { value: UserStatus.SUSPENDED, label: "Tạm khóa (Suspended)" },
  { value: UserStatus.BANNED, label: "Bị cấm (Banned)" },
  { value: UserStatus.DELETED, label: "Đã xóa (Deleted)" }
];

export function UserModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isLoading,
}: UserModalProps) {
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<CreateUserRequest>();
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  // Watch status to conditionally show ban fields
  const status = watch("status");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("username", initialData.username);
        setValue("email", initialData.email);
        setValue("proficiency", initialData.proficiency);
        setValue("status", initialData.status);
        setValue("banReason", initialData.banReason);
        if (initialData.suspendedUntil) {
            // Format date for input datetime-local if needed, or just text
            setValue("suspendedUntil", initialData.suspendedUntil); 
        }
        
        const roleIds = initialData.roles.map(r => r.id);
        setSelectedRoles(roleIds);
        setValue("roleIds", roleIds);
      } else {
        reset({
          username: "",
          email: "",
          password: "",
          proficiency: "BEGINNER",
          status: "ACTIVE",
          roleIds: [2], // Default USER (2 is LEARNER/USER in enum) -- Wait, checking user-enums.ts -> LEARNER=2.
          // Wait, in previous step I set LEARNER=2. I should use UserRoleType enum or just ID.
          // Let's check reset logic.
        });
        setSelectedRoles([2]);
      }
    }
  }, [isOpen, initialData, setValue, reset]);

  const handleRoleChange = (roleId: number, checked: boolean) => {
    let newRoles = [...selectedRoles];
    if (checked) {
      if (!newRoles.includes(roleId)) newRoles.push(roleId);
    } else {
      newRoles = newRoles.filter(id => id !== roleId);
    }
    setSelectedRoles(newRoles);
    setValue("roleIds", newRoles);
  };

  const onSubmit = (data: CreateUserRequest) => {
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tên đăng nhập</Label>
            <Input {...register("username", { required: "Bắt buộc" })} />
            {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...register("email", { required: "Bắt buộc" })} type="email" />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          {!initialData && (
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input {...register("password", { required: "Bắt buộc" })} type="password" />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Vai trò</Label>
            <div className="flex gap-4">
              {USER_ROLES.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                  />
                  <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trình độ</Label>
              <Controller
                control={control}
                name="proficiency"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {(status === UserStatus.BANNED || status === UserStatus.SUSPENDED) && (
             <div className="space-y-2">
                <Label>Lý do khóa/ban</Label>
                <Textarea {...register("banReason")} placeholder="Nhập lý do..." />
             </div>
          )}
           
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary">
              {isLoading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm mới")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
