"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Check, Loader2, BookOpen, Image as ImageIcon, X, Upload, ChevronsUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { studySetService } from "@/services/studySet.service";
import { uploadService } from "@/services/upload.service";
import { StudySetVisibility, type StudySet } from "@/types/studySet";
import type { Word } from "@/types/vocabulary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToStudySetDialogProps {
  word: Word;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToStudySetDialog({ word, isOpen, onOpenChange }: AddToStudySetDialogProps) {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Flashcard content state
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudySets();
      setFrontText(word.word);
      setBackText(word.meaning || word.vnMeaning || "");
      setCurrentImageUrl(word.imageUrl || "");
      setImageFile(null);
      setPreviewUrl("");
      setNewSetTitle("");
      setSelectedSetId("");
      setOpenCombobox(false);
      setSearchQuery("");
    }
  }, [isOpen, word]);

  const fetchStudySets = async () => {
    try {
      setLoading(true);
      const res = await studySetService.getOwn();
      // Fix: use res.metaData instead of res.data
      if (res.metaData) {
        setStudySets(res.metaData.studySets);
      }
    } catch (error) {
      console.error("Failed to fetch study sets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File ảnh quá lớn (tối đa 5MB)");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setCurrentImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!selectedSetId) return;
    if (selectedSetId === "new" && !newSetTitle.trim()) return;

    try {
      setSaving(true);
      let targetSetId = selectedSetId;
      let finalImageUrl = currentImageUrl;

      // Upload image if changed
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        if (uploadRes.metaData?.url) {
            finalImageUrl = uploadRes.metaData.url;
        } else if (uploadRes.url) { // Fallback check
            finalImageUrl = uploadRes.url;
        }
      } else if (!previewUrl && !currentImageUrl) {
          // If image removed
          finalImageUrl = "";
      }

      // 1. Create new set if selected
      if (selectedSetId === "new") {
        const newSet = await studySetService.create({
          title: newSetTitle,
          visibility: StudySetVisibility.PRIVATE, // Default to private
          flashcards: [],
          quizzes: []
        });
        
        // Fix: use newSet.metaData
        if (newSet.metaData) {
          targetSetId = newSet.metaData.id.toString();
        } else {
            throw new Error("Failed to create study set");
        }
      }

      // 2. Add flashcard to the set
      await studySetService.addFlashcard(parseInt(targetSetId), {
        frontText: frontText,
        backText: backText,
        example: word.example || undefined,
        audioUrl: word.audioUrl || undefined,
        imageUrl: finalImageUrl || undefined
      });

      toast.success("Đã lưu từ vào bộ học liệu thành công!");
      
      // Reset form and close
      onOpenChange(false);
      
    } catch (error) {
      console.error("Failed to save flashcard", error);
      toast.error("Có lỗi xảy ra khi lưu từ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lưu vào bộ học liệu</DialogTitle>
          <DialogDescription>
            Lưu từ <b>{word.word}</b> vào flashcard để ôn tập sau này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Editable Fields */}
          <div className="grid gap-4">
             <div className="grid gap-2">
                 <Label htmlFor="front-text">Mặt trước</Label>
                 <Input 
                    id="front-text" 
                    value={frontText} 
                    onChange={(e) => setFrontText(e.target.value)} 
                    placeholder="Từ vựng"
                 />
             </div>
             <div className="grid gap-2">
                 <Label htmlFor="back-text">Mặt sau</Label>
                 <Textarea 
                    id="back-text" 
                    value={backText} 
                    onChange={(e) => setBackText(e.target.value)} 
                    placeholder="Định nghĩa, nghĩa tiếng Việt..."
                    className="min-h-[80px]"
                 />
             </div>
             
             {/* Image Upload */}
             <div className="grid gap-2">
                <Label>Hình ảnh</Label>
                <div className="flex items-center gap-4">
                    {(previewUrl || currentImageUrl) ? (
                        <div className="relative group w-24 h-24 rounded-lg border overflow-hidden bg-neutral-50">
                            <img 
                                src={previewUrl || currentImageUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-500 hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer transition-colors"
                        >
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-xs">Thêm ảnh</span>
                        </div>
                    )}
                    
                    <div className="flex-1 text-sm text-neutral-500">
                        {(!previewUrl && !currentImageUrl) && "Chưa có hình ảnh minh họa."}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageSelect}
                        />
                        {(previewUrl || currentImageUrl) && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2"
                            >
                                <Upload className="w-4 h-4 mr-2" /> Thay đổi ảnh
                            </Button>
                        )}
                    </div>
                </div>
             </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="study-set">Chọn bộ học liệu</Label>
            {loading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách...
                </div>
            ) : (
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between font-normal"
                        >
                            {selectedSetId 
                                ? (selectedSetId === "new" ? "+ Tạo bộ học liệu mới" : studySets.find((set) => set.id.toString() === selectedSetId)?.title || "Chọn bộ học liệu...")
                                : "Chọn bộ học liệu..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <div className="p-2 border-b">
                            <Input 
                                placeholder="Tìm kiếm bộ học liệu..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                            <div
                                className={cn(
                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                                    selectedSetId === "new" && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => {
                                    setSelectedSetId("new");
                                    setOpenCombobox(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedSetId === "new" ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="font-medium text-primary">+ Tạo bộ học liệu mới</span>
                            </div>
                            
                            {studySets.filter(set => set.title.toLowerCase().includes(searchQuery.toLowerCase())).map((set) => (
                                <div
                                    key={set.id}
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                                        selectedSetId === set.id.toString() && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => {
                                        setSelectedSetId(set.id.toString());
                                        setOpenCombobox(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedSetId === set.id.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {set.title}
                                </div>
                            ))}
                            
                            {studySets.filter(set => set.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Không tìm thấy kết quả.
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
          </div>

          {selectedSetId === "new" && (
            <div className="grid gap-2">
              <Label htmlFor="new-set-name">
                  Tên bộ học liệu mới <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-set-name"
                value={newSetTitle}
                onChange={(e) => setNewSetTitle(e.target.value)}
                placeholder="Ví dụ: Từ vựng IELTS..."
                className={!newSetTitle.trim() ? "border-red-300 focus-visible:ring-red-300" : ""}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !selectedSetId || (selectedSetId === 'new' && !newSetTitle.trim())}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
