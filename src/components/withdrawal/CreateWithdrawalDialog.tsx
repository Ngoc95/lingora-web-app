"use client";

import { useState, useEffect } from "react";
import { useWithdrawal } from "@/hooks/useWithdrawal";
import { vietnameseBanks, CreateWithdrawalRequest, Balance } from "@/types/withdrawal";
import {
  DollarSign,
  Building2,
  CreditCard,
  User,
  MapPin,
  Send,
  Info,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: Balance | null;
  isLoadingBalance: boolean;
  isCreating: boolean;
  onCreateWithdrawal: (data: CreateWithdrawalRequest) => Promise<boolean>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
};

const formatAmountInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return new Intl.NumberFormat("vi-VN").format(parseInt(digits) || 0);
};

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 50000000;

export function CreateWithdrawalDialog({
  open,
  onOpenChange,
  balance,
  isLoadingBalance,
  isCreating,
  onCreateWithdrawal,
}: CreateWithdrawalDialogProps) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setAmount("");
      setBankName("");
      setBankAccountNumber("");
      setBankAccountName("");
      setBankBranch("");
      setErrors({});
      setShowBankDropdown(false);
    }
  }, [open]);

  const getNumericAmount = () => parseInt(amount.replace(/\D/g, "")) || 0;

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const numericAmount = getNumericAmount();

    if (!amount || numericAmount === 0) {
      newErrors.amount = "Vui lòng nhập số tiền";
    } else if (numericAmount < MIN_AMOUNT) {
      newErrors.amount = `Số tiền tối thiểu là ${formatCurrency(MIN_AMOUNT)}`;
    } else if (numericAmount > MAX_AMOUNT) {
      newErrors.amount = `Số tiền tối đa là ${formatCurrency(MAX_AMOUNT)}`;
    } else if (numericAmount > (balance?.availableBalance || 0)) {
      newErrors.amount = "Số tiền vượt quá số dư khả dụng";
    }

    if (!bankName) {
      newErrors.bankName = "Vui lòng chọn ngân hàng";
    }

    if (!bankAccountNumber) {
      newErrors.bankAccountNumber = "Vui lòng nhập số tài khoản";
    } else if (bankAccountNumber.length < 6) {
      newErrors.bankAccountNumber = "Số tài khoản không hợp lệ";
    }

    if (!bankAccountName) {
      newErrors.bankAccountName = "Vui lòng nhập tên chủ tài khoản";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await onCreateWithdrawal({
      amount: getNumericAmount(),
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankBranch: bankBranch || undefined,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setAmount(digits);
    setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-neutral-50 p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-white border-b border-neutral-100">
          <DialogTitle className="text-center text-xl font-bold">
            Tạo yêu cầu rút tiền
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 md:p-6 max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Balance Display */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white shadow-sm">
              <div className="text-white/80 text-sm mb-1">Số dư khả dụng</div>
              <div className="text-2xl font-bold">
                {isLoadingBalance ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  formatCurrency(balance?.availableBalance || 0)
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Số tiền (VND)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <input
                  type="text"
                  value={amount ? formatAmountInput(amount) : ""}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.amount
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                  }`}
                  placeholder="Nhập số tiền cần rút"
                />
              </div>
              {errors.amount ? (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              ) : (
                <p className="text-neutral-500 text-xs mt-2">
                  Tối thiểu: 50,000 VND - Tối đa: 50,000,000 VND
                </p>
              )}
            </div>

            {/* Bank Info */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 space-y-4">
              {/* Bank Name Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ngân hàng
                </label>
                <button
                  type="button"
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl text-left flex items-center justify-between bg-white ${
                    errors.bankName
                      ? "border-red-300"
                      : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                  }`}
                >
                  <div className="absolute left-4">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className={bankName ? "text-neutral-900" : "text-neutral-400"}>
                    {bankName || "Chọn ngân hàng"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                </button>
                {showBankDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {vietnameseBanks.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => {
                          setBankName(bank);
                          setShowBankDropdown(false);
                          setErrors((prev) => ({ ...prev, bankName: undefined }));
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                )}
                {errors.bankName && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                )}
              </div>

              {/* Bank Account Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Số tài khoản
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => {
                      setBankAccountNumber(e.target.value.replace(/\D/g, ""));
                      setErrors((prev) => ({ ...prev, bankAccountNumber: undefined }));
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.bankAccountNumber
                        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                        : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="Nhập số tài khoản ngân hàng"
                  />
                </div>
                {errors.bankAccountNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>
                )}
              </div>

              {/* Bank Account Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tên chủ tài khoản
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => {
                      setBankAccountName(e.target.value.toUpperCase());
                      setErrors((prev) => ({ ...prev, bankAccountName: undefined }));
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.bankAccountName
                        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                        : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="VD: NGUYEN VAN A"
                  />
                </div>
                {errors.bankAccountName ? (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccountName}</p>
                ) : (
                  <p className="text-neutral-500 text-xs mt-1">
                    Viết hoa, không dấu, giống chính xác trên thẻ ngân hàng
                  </p>
                )}
              </div>

              {/* Bank Branch (Optional) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Chi nhánh (không bắt buộc)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="VD: Chi nhánh Hà Nội"
                  />
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">Lưu ý</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Yêu cầu sẽ được xử lý trong vòng 1-3 ngày làm việc</li>
                  <li>• Vui lòng kiểm tra kỹ thông tin ngân hàng trước khi gửi</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi yêu cầu rút tiền
                </>
              )}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
