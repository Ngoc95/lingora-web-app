"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserRestrictionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, suspendedUntil?: string) => Promise<void>;
  type: "ban" | "suspend";
  userName: string;
}

export function UserRestrictionDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  userName,
}: UserRestrictionDialogProps) {
  const [reason, setReason] = useState("");
  const [suspendedUntil, setSuspendedUntil] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSuspendedUntil("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (type === "suspend" && !suspendedUntil) return;

    setIsLoading(true);
    try {
      await onConfirm(reason, type === "suspend" ? suspendedUntil : undefined);
      onClose();
    } catch (error) {
      console.error("Failed to submit restriction", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "ban" ? "Khóa tài khoản vĩnh viễn" : "Tạm ngưng tài khoản"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="text-sm text-neutral-600 mb-4">
            Bạn đang {type === "ban" ? "khóa vĩnh viễn" : "tạm ngưng"} tài khoản của <strong>{userName}</strong>.
          </div>

          <div className="space-y-2">
            <Label>Lý do</Label>
            <Textarea
              placeholder="Nhập lý do..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {type === "suspend" && (
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={suspendedUntil}
                onChange={(e) => setSuspendedUntil(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !reason || (type === "suspend" && !suspendedUntil)} 
              variant="destructive"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
