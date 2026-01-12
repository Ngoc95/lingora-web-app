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
import { vocabularyService } from "@/services/vocabulary.service";
import { topicService } from "@/services/admin/topic.service";

// Define interfaces locally if not imported
interface Word {
  id: number;
  word: string;
  meaning: string;
  vnMeaning?: string; 
  type: string;
  cefrLevel: string;
  topic?: { id: number; name: string };
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  phonetic?: string;
}

interface CreateWordRequest {
  word: string;
  meaning: string;
  vnMeaning?: string;
  type: string;
  cefrLevel: string;
  topicId?: number; // Changed to optional as per reset logic
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  phonetic?: string;
}

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateWordRequest) => void;
  initialData?: Word | null;
  isLoading: boolean;
  defaultTopicId?: number;
}

import { uploadService } from "@/services/upload.service";
import { toast } from "react-hot-toast";

// Strict Enums from Lingora_FE Word.kt
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const WORD_TYPES = [
    "NOUN", "VERB", "ADJECTIVE", "ADVERB", "PHRASE",
    "PREPOSITION", "CONJUNCTION", "INTERJECTION", "PRONOUN",
    "DETERMINER", "ARTICLE", "NUMERAL", "UNKNOWN"
];

export function WordModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isLoading,
  defaultTopicId,
}: WordModalProps) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CreateWordRequest>();
  const [topics, setTopics] = useState<any[]>([]);

  
  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAudioFile(null);
      setImageFile(null);

      if (initialData) {
        setValue("word", initialData.word);
        setValue("meaning", initialData.meaning);
        setValue("vnMeaning", initialData.vnMeaning);
        setValue("phonetic", initialData.phonetic);
        
        setValue("type", initialData.type || "noun");
        setValue("cefrLevel", initialData.cefrLevel || "A1");
        setValue("example", initialData.example);
        setValue("exampleTranslation", initialData.exampleTranslation);
        setValue("audioUrl", initialData.audioUrl);
        setValue("imageUrl", initialData.imageUrl);
        if (initialData.topic) {
          setValue("topicId", initialData.topic.id);
        }
      } else {
        reset({
          word: "",
          meaning: "",
          type: "noun",
          cefrLevel: "A1",
          topicId: defaultTopicId
        });
      }
    }
  }, [isOpen, initialData, setValue, reset, defaultTopicId]);

  const onSubmit = async (data: CreateWordRequest) => {
    setIsUploading(true);
    try {
        if (defaultTopicId) {
             data.topicId = defaultTopicId;
        } else if (data.topicId) {
             data.topicId = Number(data.topicId);
        }

        // Handle file uploads
        if (audioFile) {
            const res = await uploadService.uploadAudio(audioFile);
            data.audioUrl = res.metaData?.url || res.url; // Handle potential response structure
        }
        if (imageFile) {
            const res = await uploadService.uploadImage(imageFile);
            data.imageUrl = res.metaData?.url || res.url;
        }

        onConfirm(data);
    } catch (e) {
        toast.error("Lỗi khi upload file hoặc lưu dữ liệu");
        console.error(e);
    } finally {
        setIsUploading(false);
    }
  };

  // Adjusted ENUM values to match Kotlin 'value' parameter (lowercase)
  // But display label can be Uppercase
  const WORD_TYPE_OPTIONS = [
      { label: "NOUN", value: "noun" },
      { label: "VERB", value: "verb" },
      { label: "ADJECTIVE", value: "adjective" },
      { label: "ADVERB", value: "adverb" },
      { label: "PHRASE", value: "phrase" },
      { label: "PREPOSITION", value: "preposition" },
      { label: "CONJUNCTION", value: "conjunction" },
      { label: "INTERJECTION", value: "interjection" },
      { label: "PRONOUN", value: "pronoun" },
      { label: "DETERMINER", value: "determiner" },
      { label: "ARTICLE", value: "article" },
      { label: "NUMERAL", value: "numeral" },
      { label: "UNKNOWN", value: "unknown" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Row 1: Word & Phonetic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Từ vựng (Word) <span className="text-red-500">*</span></Label>
              <Input {...register("word", { required: "Bắt buộc" })} placeholder="Ex: Apple" />
              {errors.word && <span className="text-red-500 text-xs">{errors.word.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Phiên âm (Phonetic)</Label>
              <Input {...register("phonetic")} placeholder="Ex: /ˈæp.əl/" />
            </div>
          </div>

          {/* Row 2: Meaning & VN Meaning */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Định nghĩa (English) <span className="text-red-500">*</span></Label>
              <Textarea {...register("meaning", { required: "Bắt buộc" })} placeholder="Ex: A round fruit with red or green skin" />
               {errors.meaning && <span className="text-red-500 text-xs">{errors.meaning.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Nghĩa tiếng Việt</Label>
              <Textarea {...register("vnMeaning")} placeholder="Ex: Quả táo" />
            </div>
          </div>

          {/* Row 3: Type & Level */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Loại từ</Label>
              <Controller
                control={control}
                name="type"
                defaultValue="noun"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn loại từ" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORD_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
             <div className="space-y-2">
              <Label>Trình độ (CEFR)</Label>
              <Controller
                control={control}
                name="cefrLevel"
                defaultValue="A1"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {CEFR_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Row 5: Example */}
          <div className="space-y-2">
             <Label>Ví dụ</Label>
             <Input {...register("example")} placeholder="Ex: I eat an apple everyday." />
          </div>
          <div className="space-y-2">
             <Label>Dịch ví dụ</Label>
             <Input {...register("exampleTranslation")} placeholder="Ex: Tôi ăn một quả táo mỗi ngày." />
          </div>

          {/* Row 6: Media Upload */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audio</Label>
              <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              <Input {...register("audioUrl")} placeholder="Hoặc nhập URL..." className="mt-1 text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              <Input {...register("imageUrl")} placeholder="Hoặc nhập URL..." className="mt-1 text-xs" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isUploading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || isUploading} className="bg-primary text-white">
              {isLoading || isUploading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm mới")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
