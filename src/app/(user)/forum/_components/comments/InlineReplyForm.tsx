import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InlineReplyFormProps {
    parentId: number;
    targetUsername: string;
    onSubmit: (content: string) => void;
    onCancel: () => void;
    submitting: boolean;
}

export function InlineReplyForm({
    parentId,
    targetUsername,
    onSubmit,
    onCancel,
    submitting,
}: InlineReplyFormProps) {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text.trim());
            setText("");
        }
    };

    return (
        <div className="mt-3 ml-4 border-l-2 border-primary pl-4">
            <div className="mb-2 text-sm text-neutral-600">
                Đang trả lời <strong className="text-primary">@{targetUsername}</strong>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Viết phản hồi..."
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                    rows={2}
                    autoFocus
                />
                <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={!text.trim() || submitting} size="sm">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gửi"}
                    </Button>
                    <Button type="button" onClick={onCancel} variant="outline" size="sm">
                        Hủy
                    </Button>
                </div>
            </form>
        </div>
    );
}
