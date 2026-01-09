import { api } from "./api";
import type { Word } from "@/types/vocabulary";
import type {
    DictionaryLookupResponse,
    SuggestWordsResponse,
    TranslateResponse,
} from "@/types/dictionary";
import type { ApiResponse } from "@/types/api";

export const dictionaryService = {
    /**
     * Translate a phrase or sentence
     * POST /translate/phrase
     * Public endpoint
     */
    translatePhrase: async (text: string, sourceLang: string = "en", targetLang: string = "vi"): Promise<TranslateResponse> => {
        const response = await api.post<ApiResponse<TranslateResponse>>("/translate/phrase", {
            text,
            sourceLang,
            targetLang,
        });
        // api.post returns T directly if using proper typing, but api implementation returns data directly.
        // Checking api.ts again: post<T> returns apiClient<T>. apiClient<T> returns data.
        // If backend returns SuccessResponse wrapping result in metaData, we need to handle that.
        return response.metaData;
    },

    /**
     * Lookup a word in the dictionary
     * GET /words/dictionary?term={word}
     * Public endpoint - no authentication required
     */
    lookupWord: async (term: string): Promise<Word> => {
        const response = await api.get<DictionaryLookupResponse>(
            `/words/dictionary?term=${encodeURIComponent(term)}`
        );
        return response.metaData;
    },

    /**
     * Get word suggestions for autocomplete
     * GET /words/suggest?term={query}&limit={number}
     * Public endpoint - no authentication required
     */
    suggestWords: async (term: string, limit: number = 10): Promise<Word[]> => {
        const response = await api.get<SuggestWordsResponse>(
            `/words/suggest?term=${encodeURIComponent(term)}&limit=${limit}`
        );
        return response.metaData;
    },
};
