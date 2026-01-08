import { PostTopic } from "@/types/forum";

export const TOPIC_LABELS: Record<PostTopic, string> = {
    [PostTopic.GENERAL]: "Tổng hợp",
    [PostTopic.VOCABULARY]: "Từ vựng",
    [PostTopic.GRAMMAR]: "Ngữ pháp",
    [PostTopic.LISTENING]: "Listening",
    [PostTopic.SPEAKING]: "Speaking",
    [PostTopic.READING]: "Reading",
    [PostTopic.WRITING]: "Writing",
};
