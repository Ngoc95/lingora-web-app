import type { Word } from "./vocabulary";
import type { ApiResponse } from "./api";

/**
 * Dictionary-specific API response types
 */

export interface DictionaryLookupResponse extends ApiResponse<Word> { }

export interface SuggestWordsResponse extends ApiResponse<Word[]> { }

export interface TranslateResponse {
    originalText: string;
    translatedText: string;
    from: string;
    to: string;
    provider: string;
}
