# Module Từ Vựng (Vocabulary Module)

> **Tài liệu chi tiết** cho FE Web - Lingora Vocabulary Learning System

---

## 1. Tổng Quan Module

Module **Vocabulary** quản lý việc học từ vựng theo cấu trúc phân cấp:

```
Categories (Danh mục) → Topics (Chủ đề) → Words (Từ vựng)
```

**4 Màn hình chính:**
1. **VocabularyCategoriesScreen** - Danh sách các danh mục
2. **CategoryDetailScreen** - Chi tiết danh mục + danh sách topics
3. **TopicDetailScreen** - Chi tiết topic + cấu hình học
4. **LearnWordScreen** - Màn hình học từ (Flashcard + Quiz)

### Luồng Navigation

```mermaid
flowchart TD
    A[VocabularyCategoriesScreen] -->|Click category| B[CategoryDetailScreen]
    B -->|Click topic| C[TopicDetailScreen]
    C -->|Tab "Học từ"| D[Cấu hình số từ + loại quiz]
    C -->|Tab "Danh sách từ"| E[Xem tất cả từ trong topic]
    D -->|Bắt đầu học| F[LearnWordScreen]
    F -->|Phase LEARN| G[FlashcardComponent]
    F -->|Phase QUIZ| H[Quiz các loại]
    H -->|Hoàn thành| I[POST progress → Back]
```

---

## 2. API Endpoints

### 2.1 Progress Summary (Thống kê tổng quan)

```http
GET /progress/word-statistics
```

**Response:**
```typescript
interface ProgressSummaryResponse {
  message: string;
  statusCode: number;
  metaData: {
    totalLearnedWord: number | null;
    statistics: Array<{
      srsLevel: number;      // 0-5 (SRS level)
      wordCount: number;
    }> | null;
  };
}
```

---

### 2.2 Categories với Progress

```http
GET /progress/categories
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Số item/page |
| `page` | number | 1 | Trang hiện tại |
| `search` | string | null | Tìm kiếm theo tên |

**Response:**
```typescript
interface CategoryProgressListResponse {
  message: string;
  statusCode: number;
  metaData: {
    currentPage: number;
    totalPages: number;
    total: number;
    categories: CategoryProgress[];
  };
}

interface CategoryProgress {
  id: number;
  name: string;
  description: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;   // 0-100
  completed: boolean;
}
```

---

### 2.3 Topics trong Category với Progress

```http
GET /progress/categories/{categoryId}/topics
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `categoryId` | number | - | ID của category |
| `limit` | number | 20 | Số item/page |
| `page` | number | 1 | Trang hiện tại |
| `search` | string | null | Tìm kiếm theo tên |
| `sort` | string | null | Sắp xếp |

**Response:**
```typescript
interface CategoryTopicProgressResponse {
  message: string;
  statusCode: number;
  metaData: {
    categoryId: number;
    name: string;              // Category name
    description: string;       // Category description
    totalTopics: number;
    completedTopics: number;
    progressPercent: number;
    completed: boolean;
    currentPage: number;
    totalPages: number;
    topics: TopicProgress[];
  };
}

interface TopicProgress {
  id: number;
  name: string;
  description: string;
  totalWords: number;
  learnedWords: number;
  completed: boolean;
}
```

---

### 2.4 Words trong Topic với Progress

```http
GET /progress/topics/{topicId}/words
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `topicId` | number | - | ID của topic |
| `limit` | number | 20 | Số item/page |
| `page` | number | 1 | Trang hiện tại |
| `search` | string | null | Tìm kiếm theo từ |
| `hasLearned` | boolean | null | true=đã học, false=chưa học, null=tất cả |

**Response:**
```typescript
interface TopicWordProgressResponse {
  message: string;
  statusCode: number;
  metaData: {
    topicId: number;
    totalWordsAll: number;       // Tổng số từ trong topic
    learnedCountAll: number;     // Số từ đã học
    completed: boolean;
    progressPercent: number;     // 0-100
    currentPage: number;
    totalPages: number;
    totalWordsFiltered: number;  // Số từ sau filter
    words: WordWithProgress[];
  };
}

interface WordWithProgress {
  id: number;
  word: string;
  phonetic: string | null;
  cefrLevel: string;           // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  type: string;                // "noun" | "verb" | "adj" | ...
  meaning: string | null;
  vnMeaning: string | null;
  example: string | null;
  exampleTranslation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  progress: WordProgress | null;  // null nếu chưa học
}

interface WordProgress {
  id: number;
  status: WordStatus;
  srsLevel: number;              // 0-5
  learnedAt: string | null;      // ISO datetime
  nextReviewDay: string | null;  // ISO datetime
  wrongCount: number;
  reviewedDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

type WordStatus = "NEW" | "LEARNING" | "REVIEWING" | "MASTERED" | "FORGOTTEN";
```

---

### 2.5 Words để Học (Study Words)

```http
GET /progress/topics/{topicId}/study?count={wordCount}
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `topicId` | number | ID của topic |
| `count` | number | Số lượng từ muốn học (5, 10, 15, 20, 25, 30) |

**Response:**
```typescript
interface StudyWordsResponse {
  message: string;
  statusCode: number;
  metaData: {
    topicId: number;
    total: number;
    words: Word[];
  };
}

interface Word {
  id: number;
  topicId: number;
  word: string;
  phonetic: string | null;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  type: string | null;
  meaning: string | null;
  vnMeaning: string | null;
  example: string | null;
  exampleTranslation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
}
```

---

### 2.6 Words để Review (Ôn tập)

```http
GET /progress/review
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Số item/page |
| `page` | number | 1 | Trang hiện tại |

**Response:**
```typescript
interface ReviewWordsResponse {
  message: string;
  statusCode: number;
  metaData: {
    page: number;
    limit: number;
    total: number;
    words: Word[];  // Từ cần review
  };
}
```

---

### 2.7 Tạo Word Progress (Sau khi học)

```http
POST /progress
```

**Request Body:**
```typescript
interface CreateWordProgressRequest {
  wordIds: number[];  // Mảng ID các từ đã học
}
```

**Response:**
```typescript
interface CreateWordProgressResponse {
  message: string;
  statusCode: number;
  metaData: {
    userId: number;
    totalCreated: number;
    wordProgresses: Array<{
      id: number;
      word: Word | null;
      status: WordStatus;
      srsLevel: number;
      learnedAt: string | null;
      nextReviewDay: string | null;
      createdAt: string | null;
      updatedAt: string | null;
    }>;
  };
}
```

---

### 2.8 Cập nhật Word Progress (Sau khi review)

```http
PATCH /progress
```

**Request Body:**
```typescript
interface UpdateWordProgressRequest {
  wordProgress: Array<{
    wordId: number;
    wrongCount: number;
    reviewedDate: string;  // ISO datetime
  }>;
}
```

**Response:**
```typescript
interface ApiResponse<WordProgressMetaData> {
  message: string;
  statusCode: number;
  metaData: {
    userId: number;
    totalUpdated: number;
    wordProgresses: WordProgress[];
  };
}
```

---

### 2.9 Dictionary (Từ điển)

#### Suggest Words (Gợi ý từ)
```http
GET /words/suggest?term={term}&limit={limit}
```

**Response:**
```typescript
interface ApiResponse<Word[]> {
  message: string;
  statusCode: number;
  metaData: Word[];
}
```

#### Lookup Word (Tra từ)
```http
GET /words/dictionary?term={term}
```

**Response:**
```typescript
interface ApiResponse<Word> {
  message: string;
  statusCode: number;
  metaData: Word;
}
```

---

## 3. Các Loại Quiz (GameType)

Module hỗ trợ **6 loại quiz**. Người dùng **phải chọn ít nhất 2 loại** để bắt đầu học.

```typescript
enum GameType {
  LISTEN_FILL = "LISTEN_FILL",           // Nghe điền từ
  LISTEN_CHOOSE = "LISTEN_CHOOSE",       // Nghe chọn từ
  TRUE_FALSE = "TRUE_FALSE",             // Đúng/Sai
  SEE_WORD_CHOOSE_MEANING = "SEE_WORD_CHOOSE_MEANING",  // Nhìn từ chọn nghĩa
  SEE_MEANING_CHOOSE_WORD = "SEE_MEANING_CHOOSE_WORD",  // Nhìn nghĩa chọn từ
  PRONUNCIATION = "PRONUNCIATION"        // Luyện phát âm
}
```

### Chi Tiết Từng Loại

| GameType | Tên Hiển Thị | Input Type | Options |
|----------|-------------|------------|---------|
| `LISTEN_FILL` | Nghe điền từ | Text input | - |
| `LISTEN_CHOOSE` | Nghe chọn từ | Multiple choice | 4 options |
| `TRUE_FALSE` | Đúng/Sai | 2 buttons | Đúng/Sai |
| `SEE_WORD_CHOOSE_MEANING` | Nhìn từ chọn nghĩa | Multiple choice | 4 meanings |
| `SEE_MEANING_CHOOSE_WORD` | Nhìn nghĩa chọn từ | Multiple choice | 4 words |
| `PRONUNCIATION` | Luyện phát âm | Speech recognition | - |

---

## 4. Logic Sinh Câu Hỏi Quiz

```typescript
interface QuizQuestion {
  type: GameType;
  question: string;
  correctAnswer: string;
  options: string[];    // Empty cho LISTEN_FILL, PRONUNCIATION
  word: Word;
  attemptCount: number; // Cho PRONUNCIATION
}
```

### Số lượng câu hỏi
```typescript
const totalQuestions = Math.max(1, words.length * 2);
```

### Logic sinh từng loại

| Type | Question Format | Correct Answer | Options |
|------|----------------|----------------|---------|
| LISTEN_FILL | `Nghe và điền từ tiếng Anh của "${meaning}":` | word.word | [] |
| LISTEN_CHOOSE | `Nghe và chọn từ đúng` | word.word | [word + 3 random words] |
| TRUE_FALSE | `"${word}" có nghĩa là "${meaning/wrongMeaning}"` | "Đúng" / "Sai" | ["Đúng", "Sai"] |
| SEE_WORD_CHOOSE_MEANING | `Nghĩa của từ "${word}" là gì?` | word.meaning | [meaning + 3 random meanings] |
| SEE_MEANING_CHOOSE_WORD | `Từ tiếng Anh của "${meaning}" là gì?` | word.word | [word + 3 random words] |
| PRONUNCIATION | `Phát âm từ "${word}"` | word.word | [] |

---

## 5. State Management

### VocabularyCategoriesUiState
```typescript
interface VocabularyCategoriesUiState {
  categories: CategoryProgress[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  searchQuery: string;
}
```

### CategoryDetailUiState
```typescript
interface CategoryDetailUiState {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  completed: boolean;
  topics: TopicProgress[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  sortQuery: string;
}
```

### TopicDetailUiState
```typescript
interface TopicDetailUiState {
  topicId: number;
  totalWordsAll: number;
  learnedCountAll: number;
  masteredWordsCount: number;
  progressPercent: number;
  completed: boolean;
  words: WordWithProgress[];
  studyWords: Word[];
  isLoading: boolean;
  isLoadingStudyWords: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalWordsFiltered: number;
  searchQuery: string;
  hasLearnedFilter: boolean | null;
  selectedWordCount: number;       // 5, 10, 15, 20, 25, 30
  selectedGameTypes: Set<GameType>;
}
```

### LearningState
```typescript
interface LearningState {
  phase: "LEARN" | "QUIZ";
  currentWordIndex: number;
  isFlashcardRevealed: boolean;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  typedAnswer: string;
  isAnswerChecked: boolean;
  correctAnswers: number;
  showCompletionDialog: boolean;
  showExitDialog: boolean;
}
```

---

## 6. UI Components

### 6.1 CategoryCard

```
┌──────────────────────────────────────────────────┐
│ Category Name                               →    │
│ Description text here...                         │
│                                                  │
│ ┌──────────┐ ┌────────┐ ┌─────────────────┐      │
│ │ 5 chủ đề │ │ 45.5%  │ │ 2/5 hoàn thành  │      │
│ └──────────┘ └────────┘ └─────────────────┘      │
└──────────────────────────────────────────────────┘
```

**Props:**
- `title: string`
- `description: string`
- `topicCount: number`
- `completedTopics: number`
- `progressPercent: number`
- `onClick: () => void`

### 6.2 TopicCard

```
┌──────────────────────────────────────────────────┐
│ Topic Name                                       │
│ Description text here...                         │
│                                                  │
│ Tiến trình                          15/50 từ    │
└──────────────────────────────────────────────────┘
```

**Props:**
- `title: string`
- `description: string`
- `learnedWords: number`
- `totalWords: number`
- `onClick: () => void`

### 6.3 WordCountSelector

```
┌──────────────────────────────────────────────────┐
│ SỐ TỪ HỌC                                        │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│ │ 5  │ │ 10 │ │ 15 │ │ 20 │ │ 25 │ │ 30 │       │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘       │
└──────────────────────────────────────────────────┘
```

### 6.4 QuestionTypeSelector

```
┌──────────────────────────────────────────────────┐
│ LOẠI CÂU HỎI (chọn ít nhất 2)                   │
│ ┌─────────────────┐ ┌─────────────────┐         │
│ │ ✓ Nghe điền từ  │ │ ✓ Nghe chọn từ  │         │
│ └─────────────────┘ └─────────────────┘         │
│ ┌─────────────────┐ ┌───────────────────────┐   │
│ │ ✓ Đúng/Sai      │ │ ✓ Nhìn từ chọn nghĩa  │   │
│ └─────────────────┘ └───────────────────────┘   │
│ ┌───────────────────────┐ ┌─────────────────┐   │
│ │ ✓ Nhìn nghĩa chọn từ  │ │ ✓ Luyện phát âm │   │
│ └───────────────────────┘ └─────────────────┘   │
└──────────────────────────────────────────────────┘
```

### 6.5 FlashcardComponent

**Mặt trước:**
```
┌──────────────────────────────────────┐
│           [Hình ảnh từ]              │
│                                      │
│              WORD                    │
│          🔊 /phonetic/               │
│                                      │
│         "Nhấn để xem nghĩa"          │
└──────────────────────────────────────┘
```

**Mặt sau (flip animation):**
```
┌──────────────────────────────────────┐
│           MEANING                    │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ "Example sentence..."          │  │
│  │ "Bản dịch..."                  │  │
│  └────────────────────────────────┘  │
│                                      │
│          🔊 /phonetic/               │
└──────────────────────────────────────┘
```

### 6.6 QuizPhaseContent

```
┌──────────────────────────────────────┐
│           Câu 1/10                   │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ LOẠI QUIZ                  🔊  │  │
│  │ Nội dung câu hỏi...            │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Option A                       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Option B                   ✓   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │           KIỂM TRA             │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 6.7 PronunciationQuizContent

```
┌──────────────────────────────────────┐
│           LUYỆN PHÁT ÂM             │
├──────────────────────────────────────┤
│              WORD                    │
│           /phonetic/                 │
│           "meaning"                  │
│              🔊                      │
│           Nghe mẫu                   │
│                                      │
│              ┌────┐                  │
│              │ 🎤 │    ← Nút ghi âm  │
│              └────┘                  │
│           Nhấn để đọc                │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ✓ Chính xác!                   │  │
│  │ Bạn nói: "word"                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 7. Logic Xử Lý Quiz

### Trả lời ĐÚNG
1. Tăng `correctAnswers`
2. Xóa câu hỏi khỏi danh sách
3. Nếu hết câu → Hiển thị Completion Dialog
4. Còn câu → Chuyển câu tiếp

### Trả lời SAI
1. Xóa câu hỏi khỏi vị trí hiện tại
2. Đưa câu xuống cuối danh sách (hỏi lại sau)
3. Chuyển câu tiếp

### Pronunciation đặc biệt
- **Lần 1 sai:** Đưa xuống cuối, tăng `attemptCount`
- **Lần 2 sai:** Bỏ qua câu này (không tính đúng)
- **Đúng:** Tính điểm và xóa câu

---

## 8. Completion Flow

```typescript
// Hiển thị completion dialog
const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

// Gọi API tạo progress
const wordIds = studyWords.map(w => w.id);
await createWordProgress({ wordIds });

// Quay về TopicDetailScreen
navigate(-1);
```

---

## 9. TypeScript Interfaces Tổng Hợp

```typescript
// === Enums ===
enum GameType {
  LISTEN_FILL = "LISTEN_FILL",
  LISTEN_CHOOSE = "LISTEN_CHOOSE",
  TRUE_FALSE = "TRUE_FALSE",
  SEE_WORD_CHOOSE_MEANING = "SEE_WORD_CHOOSE_MEANING",
  SEE_MEANING_CHOOSE_WORD = "SEE_MEANING_CHOOSE_WORD",
  PRONUNCIATION = "PRONUNCIATION"
}

enum WordStatus {
  NEW = "NEW",
  LEARNING = "LEARNING",
  REVIEWING = "REVIEWING",
  MASTERED = "MASTERED",
  FORGOTTEN = "FORGOTTEN"
}

// === Domain Models ===
interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface CategoryProgress {
  id: number;
  name: string;
  description: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  completed: boolean;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface TopicProgress {
  id: number;
  name: string;
  description: string;
  totalWords: number;
  learnedWords: number;
  completed: boolean;
}

interface Word {
  id: number;
  topicId: number;
  word: string;
  phonetic: string | null;
  cefrLevel: string;
  type: string | null;
  meaning: string | null;
  vnMeaning: string | null;
  example: string | null;
  exampleTranslation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
}

interface WordProgress {
  id: number;
  wordId: number;
  userId: number;
  status: WordStatus;
  srsLevel: number;
  learnedAt: Date | null;
  nextReviewDay: Date | null;
  wrongCount: number;
  reviewedDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface WordWithProgress extends Word {
  progress: WordProgress | null;
}

interface QuizQuestion {
  type: GameType;
  question: string;
  correctAnswer: string;
  options: string[];
  word: Word;
  attemptCount: number;
}
```

---

## 10. Navigation Routes

```typescript
// Categories list (trong bottom nav)
/vocabulary

// Category detail
/vocabulary/category/:categoryId

// Topic detail
/vocabulary/category/:categoryId/topic/:topicId

// Learn screen
/learn/:topicId?wordCount=15&gameTypes=LISTEN_FILL,TRUE_FALSE,PRONUNCIATION
```

---

## 11. Lưu Ý Triển Khai Web

### Speech Recognition (Web Speech API)
```typescript
const recognition = new (window.SpeechRecognition || 
                         window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.maxAlternatives = 5;
```

### Audio Playback
```typescript
const audio = new Audio(audioUrl);
audio.play();
```

### Flashcard Animation
```css
.flashcard {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}
.flashcard.flipped {
  transform: rotateY(180deg);
}
```

### Pagination (Infinite Scroll)
- Load thêm khi scroll đến item cuối - 3
- Kiểm tra `currentPage < totalPages` trước khi load

---

## 12. Testing Checklist

- [ ] Load categories với pagination + search
- [ ] Load topics trong category với pagination + search
- [ ] Load words trong topic với filter đã học/chưa học
- [ ] Chọn số từ học (5-30)
- [ ] Chọn/bỏ chọn loại quiz (minimum 2)
- [ ] Flashcard flip animation
- [ ] Phát audio khi vào flashcard
- [ ] 6 loại quiz hoạt động đúng
- [ ] Câu sai đưa xuống cuối
- [ ] Pronunciation với speech recognition
- [ ] Completion dialog + tính % accuracy
- [ ] POST progress sau khi xong
- [ ] Exit dialog khi back

---

> **Cập nhật:** Tháng 1/2026
> **Phiên bản:** 2.0
