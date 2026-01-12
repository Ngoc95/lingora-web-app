"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ApproveWithdrawalDialog({ isOpen, onClose, onConfirm, isLoading }: ApproveDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phê duyệt yêu cầu rút tiền</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn phê duyệt yêu cầu này? Hành động này sẽ chuyển trạng thái sang "Đang xử lý".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button onClick={onConfirm} disabled={isLoading} className="bg-primary text-white">
            {isLoading ? "Đang xử lý..." : "Phê duyệt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function RejectWithdrawalDialog({ isOpen, onClose, onConfirm, isLoading }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối yêu cầu rút tiền</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối yêu cầu này.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
            <Label>Lý do từ chối</Label>
            <Textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Nhập lý do..."
                className="mt-1"
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button onClick={handleConfirm} disabled={isLoading || !reason.trim()} variant="destructive">
            {isLoading ? "Đang xử lý..." : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionReference: string) => void;
  isLoading: boolean;
}

export function CompleteWithdrawalDialog({ isOpen, onClose, onConfirm, isLoading }: CompleteDialogProps) {
  const [txRef, setTxRef] = useState("");

  const handleConfirm = () => {
    onConfirm(txRef);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hoàn thành giao dịch</DialogTitle>
          <DialogDescription>
            Vui lòng nhập mã giao dịch ngân hàng để xác nhận đã chuyển khoản thành công.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
            <Label>Mã giao dịch (Transaction Ref)</Label>
            <Input 
                value={txRef} 
                onChange={(e) => setTxRef(e.target.value)} 
                placeholder="Ví dụ: VCB123456789"
                className="mt-1"
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button onClick={handleConfirm} disabled={isLoading || !txRef.trim()} className="bg-green-600 hover:bg-green-700 text-white">
            {isLoading ? "Đang xử lý..." : "Hoàn thành"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function FailWithdrawalDialog({ isOpen, onClose, onConfirm, isLoading }: FailDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo giao dịch thất bại</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do giao dịch thất bại (ví dụ: Lỗi ngân hàng, sai số tài khoản).
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
            <Label>Lý do thất bại</Label>
            <Textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Nhập lý do..."
                className="mt-1"
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button onClick={handleConfirm} disabled={isLoading || !reason.trim()} variant="destructive">
            {isLoading ? "Đang xử lý..." : "Xác nhận thất bại"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
